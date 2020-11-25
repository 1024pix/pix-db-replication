'use strict';

const execa = require('execa');
const fs = require('fs');
const retry = require('p-retry');

const airtableData = require('./airtable-data');
const enrichment = require('./enrichment');
const logger = require('./logger');
const moment = require('moment');

const RESTORE_LIST_FILENAME = 'restore.list';

function shellSync(cmdline) {
  execa.sync(cmdline, { stdio: 'inherit', shell: true });
}

function execSync(cmd, args) {
  execa.sync(cmd, args, { stdio: 'inherit' });
}

function execSyncStdOut(cmd, args) {
  return execa.sync(cmd, args, { stderr: 'inherit' }).stdout;
}

function setRetriesTimeout(maxMinutes) {
  const milliseconds = maxMinutes * 60000;
  return setTimeout(() => {
    logger.warn('Les tentatives de réplication ont dépassé %d minutes !', maxMinutes);
  }, milliseconds);
}

function setAirTableRetriesTimeout(maxMinutes) {
  const milliseconds = maxMinutes * 60000;
  return setTimeout(() => {
    logger.warn('Les tentatives de réplication AirTable ont dépassé %d minutes !', maxMinutes);
  }, milliseconds);
}

function retryFunction(fn, maxRetryCount) {
  return retry(fn, {
    onFailedAttempt: (error) => {
      logger.error(error);
    },
    retries: maxRetryCount
  });
}

function retryFunctionAirTable(fn, maxRetryCount) {
  return retry(fn, {
    onFailedAttempt: (error) => {
      logger.error(error);
      // TODO: execute this code only for Airtable, not for database dump download
      if (error.message !== '503 - SERVICE_UNAVAILABLE - The service is temporarily unavailable. Please retry shortly.') {
        throw error;
      }
    },
    retries: maxRetryCount
  });
}

// dbclient-fetch assumes $HOME/bin is in the PATH
function setupPath() {
  shellSync('mkdir -p "$HOME/bin"');
  // eslint-disable-next-line no-process-env
  process.env.PATH = process.env.HOME + '/bin' + ':' + process.env.PATH;
}

function installScalingoCli() {
  shellSync('curl -Ss -O https://cli-dl.scalingo.io/install && bash install --yes --install-dir "$HOME/bin"');
}

function installPostgresClient(configuration) {
  execSync('dbclient-fetcher', [ 'pgsql', configuration.PG_CLIENT_VERSION ]);
}

function scalingoSetup(configuration) {
  setupPath();
  installScalingoCli();
  installPostgresClient(configuration);
}

function getPostgresAddonId() {
  const addonsOutput = execSyncStdOut('scalingo', [ 'addons' ]);
  try {
    const { addonId } = addonsOutput.match(/PostgreSQL\s*\|\s*(?<addonId>\S+)/).groups;

    return addonId;
  } catch (error) {
    logger.error({ output: addonsOutput, err: error }, 'Could not extract add-on ID from "scalingo addons" output');
    throw error;
  }
}

function _getBackupIdForDate(backupsOutput, date) {
  const status = 'done';
  const isBackupFromTodayDone = new RegExp(`^\\|\\s*(?<backupId>[^ |]+)[\\s|,\\w]+${date}.*${status}`, 'm');
  const matchedBackupId = backupsOutput.match(isBackupFromTodayDone);

  if (!matchedBackupId) {
    throw new Error('The backup for yesterday is not available');
  }

  return matchedBackupId.groups;
}

function getBackupId({ addonId }) {
  const backupsOutput = execSyncStdOut('scalingo', [ '--addon', addonId, 'backups' ]);
  try {
    const today = moment().format('D MMM Y');
    const { backupId } = _getBackupIdForDate(backupsOutput, today);

    return backupId;
  } catch (error) {
    logger.error({ output: backupsOutput, err: error }, 'Could not extract backup ID from "scalingo backups" output');
    throw error;
  }
}

function downloadBackup({ addonId, backupId }) {
  const compressedBackup = 'backup.tar.gz';
  execSync('scalingo', [ '--addon', addonId, 'backups-download', '--silent', '--backup', backupId, '--output', compressedBackup ]);

  if (!fs.existsSync('backup.tar.gz')) {
    throw new Error('Backup download failed');
  }

  return compressedBackup;
}

function extractBackup({ compressedBackup }) {
  // MACOS: execSync('tar', [ 'xvzf', compressedBackup ]);
  execSync('tar', [ 'xvzf', compressedBackup, '--wildcards', '*.pgsql' ]);
  const backupFile = fs.readdirSync('.').find((f) => /.*\.pgsql$/.test(f));
  if (!backupFile) {
    throw new Error(`Could not find .pgsql file in ${compressedBackup}`);
  }
  return backupFile;
}

function dropCurrentObjects(configuration) {
  // TODO: pass DATABASE_URL by argument
  execSync('psql', [ configuration.DATABASE_URL, ' --echo-all', 'ON_ERROR_STOP=1', '--command', 'DROP OWNED BY CURRENT_USER CASCADE' ]);
}

function dropCurrentObjectsButKesAndAnswers(configuration) {
  const dropTableQuery = execSyncStdOut('psql', [ configuration.DATABASE_URL, '--tuples-only', '--command', 'select string_agg(\'drop table "\' || tablename || \'" CASCADE\', \'; \') from pg_tables where schemaname = \'public\' and tablename not in (\'knowledge-elements\', \'answers\');' ]);
  const dropFunction = execSyncStdOut('psql', [ configuration.DATABASE_URL, '--tuples-only', '--command', 'select string_agg(\'drop function "\' || proname || \'"\', \'; \') FROM pg_proc pp INNER JOIN pg_roles pr ON pp.proowner = pr.oid WHERE pr.rolname = current_user ' ]);
  execSync('psql', [ configuration.DATABASE_URL, 'ON_ERROR_STOP=1', '--echo-all' , '--command', dropTableQuery ]);
  execSync('psql', [ configuration.DATABASE_URL, 'ON_ERROR_STOP=1', '--echo-all' , '--command', dropFunction ]);
}

function writeListFileForReplication({ backupFile, configuration }) {
  const backupObjectList = execSyncStdOut('pg_restore', [ backupFile, '-l' ]);
  const backupObjectLines = backupObjectList.split('\n');
  const filteredObjectLines = _filterObjectLines(backupObjectLines, configuration);
  fs.writeFileSync(RESTORE_LIST_FILENAME, filteredObjectLines.join('\n'));
}

function restoreBackup({ backupFile, databaseUrl, configuration }) {
  logger.info('Start restore');

  try {
    writeListFileForReplication({ backupFile, configuration });
    // TODO: pass DATABASE_URL by argument
    execSync('pg_restore', [
      '--verbose',
      '--jobs', configuration.PG_RESTORE_JOBS,
      '--no-owner',
      '--use-list', RESTORE_LIST_FILENAME,
      `--dbname=${databaseUrl}`,
      backupFile
    ]);

  } finally {
    fs.unlinkSync(backupFile);
  }

  logger.info('Restore done');
}

async function getScalingoBackup() {
  const addonId = await getPostgresAddonId();
  logger.info('Add-on ID: ' + addonId);

  const backupId = getBackupId({ addonId });
  logger.info('Backup ID: ' + backupId);

  const compressedBackup = downloadBackup({ addonId, backupId });
  return extractBackup({ compressedBackup });
}

function dropObjectAndRestoreBackup(backupFile, configuration) {
  if (configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY && configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'true') {
    dropCurrentObjectsButKesAndAnswers(configuration);
  } else {
    dropCurrentObjects(configuration);
  }

  restoreBackup({ backupFile, databaseUrl: configuration.DATABASE_URL, configuration });
}

async function  importAirtableData(configuration) {

  const wrappedCall = async function() {
    try {
      await airtableData.fetchAndSaveData(configuration);
    } catch (error) {
      // An AirTableError is throw => {
      //   "error": "SERVICE_UNAVAILABLE",
      //   "message": "The service is temporarily unavailable. Please retry shortly.",
      //   "statusCode": 503
      // }
      // If let as-is, it will be intercepted by p-retry which performs a type check
      // It must be Error, otherwise an error is thrown instead of retrying the action (its actual purpose)
      // https://github.com/sindresorhus/p-retry/blob/master/index.js#L44
      // To avoid this, we create a brand-new error with the right type and throw it to p-retry
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`${error.statusCode} - ${error.error} - ${error.message}`);
      }
    }
  };

  let airtableRetriesAlarm;
  logger.info('airtableData.fetchAndSaveData - Started');
  try {
    airtableRetriesAlarm = setAirTableRetriesTimeout(configuration.RETRIES_TIMEOUT_MINUTES);
    await retryFunctionAirTable(wrappedCall, configuration.MAX_RETRY_COUNT);
  } finally {
    clearTimeout(airtableRetriesAlarm);
  }
  logger.info('airtableData.fetchAndSaveData - Ended');

}

async function addEnrichment(configuration) {
  logger.info('enrichment.add - Started');
  await enrichment.add(configuration);
  logger.info('enrichment.add - Ended');
}

async function fullReplicationAndEnrichment(configuration) {
  logger.info('Start replication and enrichment');

  logger.info('Download and restore backup');
  let retriesAlarm;
  try {
    retriesAlarm = setRetriesTimeout(configuration.RETRIES_TIMEOUT_MINUTES);
    await retryFunction(async () => {
      const backup = await getScalingoBackup();
      await dropObjectAndRestoreBackup(backup, configuration);
    }, configuration.MAX_RETRY_COUNT);
  } finally {
    clearTimeout(retriesAlarm);
  }

  logger.info('Retrieve AirTable data to database ');
  await importAirtableData(configuration);

  logger.info('Enrich');
  await addEnrichment(configuration);

  logger.info('Full replication and enrichment done');

}

function _filterObjectLines(objectLines, configuration) {
  const restoreFkConstraints = configuration.RESTORE_FK_CONSTRAINTS === 'true';
  const restoreAnswersAndKes = configuration.RESTORE_ANSWERS_AND_KES === 'true';
  let filteredObjectLines = objectLines
    .filter((line) => !/ COMMENT /.test(line));
  if (!restoreFkConstraints) {
    filteredObjectLines = filteredObjectLines.filter((line) => !/FK CONSTRAINT/.test(line));
  }
  if (!restoreAnswersAndKes) {
    filteredObjectLines = filteredObjectLines
      .filter((line) => !/answers/.test(line))
      .filter((line) => !/knowledge-elements/.test(line))
      .filter((line) => !/knowledge_elements/.test(line));
  }

  return filteredObjectLines;
}

module.exports = {
  dropObjectAndRestoreBackup,
  fullReplicationAndEnrichment,
  importAirtableData,
  restoreBackup,
  retryFunction,
  scalingoSetup,
  _getBackupIdForDate
};
