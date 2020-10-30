'use strict';

// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

const PG_CLIENT_VERSION = process.env.PG_CLIENT_VERSION || '12';
const PG_RESTORE_JOBS = parseInt(process.env.PG_RESTORE_JOBS, 10) || 4;
const MAX_RETRY_COUNT = parseInt(process.env.MAX_RETRY_COUNT, 10) || 10;
const RETRIES_TIMEOUT_MINUTES = parseInt(process.env.RETRIES_TIMEOUT_MINUTES, 10) || 180;

const execa = require('execa');
const fs = require('fs');
const retry = require('p-retry');

const airtableData = require('./airtable-data');
const enrichment = require('./enrichment');
const logger = require('./logger');

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

function retryFunction(fn, maxRetryCount) {
  return retry(fn, {
    onFailedAttempt: (error) => {
      logger.error(error);
    },
    retries: maxRetryCount
  });
}

// dbclient-fetch assumes $HOME/bin is in the PATH
function setupPath() {
  shellSync('mkdir -p "$HOME/bin"');
  process.env.PATH = process.env.HOME + '/bin' + ':' + process.env.PATH;
}

function installScalingoCli() {
  shellSync('curl -Ss -O https://cli-dl.scalingo.io/install && bash install --yes --install-dir "$HOME/bin"');
}

function installPostgresClient() {
  execSync('dbclient-fetcher', [ 'pgsql', PG_CLIENT_VERSION ]);
}

function scalingoSetup() {
  setupPath();
  installScalingoCli();
  installPostgresClient();
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

function getBackupId({ addonId }) {
  const backupsOutput = execSyncStdOut('scalingo', [ '--addon', addonId, 'backups' ]);
  try {
    const { backupId } = backupsOutput.match(/^\|\s*(?<backupId>[^ |]+).*done/m).groups;

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

function dropCurrentObjects() {
  execSync('psql', [ process.env.DATABASE_URL, '-c', 'DROP OWNED BY CURRENT_USER CASCADE' ]);
}

function dropCurrentObjectsButKesAndAnswers() {
  const dropTableQuery = execSyncStdOut('psql', [ process.env.DATABASE_URL, '--tuples-only', '--command', 'select string_agg(\'drop table "\' || tablename || \'" CASCADE\', \'; \') from pg_tables where schemaname = \'public\' and tablename not in (\'knowledge-elements\', \'answers\');' ]);
  const dropFunction = execSyncStdOut('psql', [ process.env.DATABASE_URL, '--tuples-only', '--command', 'select string_agg(\'drop function "\' || proname || \'"\', \'; \') FROM pg_proc pp INNER JOIN pg_roles pr ON pp.proowner = pr.oid WHERE pr.rolname = current_user AND pp.prokind = \'f\'' ]);
  execSync('psql', [ process.env.DATABASE_URL, '-c', dropTableQuery ]);
  execSync('psql', [ process.env.DATABASE_URL, '-c', dropFunction ]);
}

function writeListFileForReplication({ backupFile }) {
  const backupObjectList = execSyncStdOut('pg_restore', [ backupFile, '-l' ]);
  const backupObjectLines = backupObjectList.split('\n');
  const filteredObjectLines = _filterObjectLines(backupObjectLines);
  fs.writeFileSync(RESTORE_LIST_FILENAME, filteredObjectLines.join('\n'));
}

function restoreBackup({ backupFile, databaseUrl }) {
  logger.info('Start restore');

  try {
    writeListFileForReplication({ backupFile });
    execSync('pg_restore', [
      '--verbose',
      '--jobs', PG_RESTORE_JOBS,
      '--no-owner',
      '--use-list', RESTORE_LIST_FILENAME,
      '-d', databaseUrl,
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

function dropObjectAndRestoreBackup(backupFile) {
  if (process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY && process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'true') {
    dropCurrentObjectsButKesAndAnswers();
  } else {
    dropCurrentObjects();
  }

  restoreBackup({ backupFile, databaseUrl: process.env.DATABASE_URL });
}

async function importAirtableData() {
  await airtableData.fetchAndSaveData();
}

async function addEnrichment() {
  await enrichment.add();
}

async function fullReplicationAndEnrichment() {
  logger.info('Start replication and enrichment');

  let retriesAlarm;
  try {
    retriesAlarm = setRetriesTimeout(RETRIES_TIMEOUT_MINUTES);
    await retryFunction(async () => {
      const backup = await getScalingoBackup();
      await dropObjectAndRestoreBackup(backup);
    }, MAX_RETRY_COUNT);
  } finally {
    clearTimeout(retriesAlarm);
  }

  await importAirtableData();

  await addEnrichment();

  logger.info('Full replication and enrichment done');
}

function _filterObjectLines(objectLines) {
  const restoreFkConstraints = process.env.RESTORE_FK_CONSTRAINTS === 'true';
  const restoreAnswersAndKes = process.env.RESTORE_ANSWERS_AND_KES === 'true';
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
  addEnrichment,
  dropObjectAndRestoreBackup,
  downloadBackup,
  dropCurrentObjects,
  extractBackup,
  fullReplicationAndEnrichment,
  getBackupId,
  getPostgresAddonId,
  importAirtableData,
  installPostgresClient,
  installScalingoCli,
  restoreBackup,
  retryFunction,
  setupPath,
  scalingoSetup,
};
