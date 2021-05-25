/* eslint-disable no-process-env */
'use strict';

const execa = require('execa');
const fs = require('fs');

const airtableData = require('./airtable-data');
const enrichment = require('./enrichment');
const logger = require('./logger');

const RESTORE_LIST_FILENAME = 'restore.list';

function execShell(cmdline) {
  return execa(cmdline, { stdio: 'inherit', shell: true });
}

function exec(cmd, args) {
  return execa(cmd, args, { stdio: 'inherit' });
}

async function execStdOut(cmd, args) {
  const { stdout } = await execa(cmd, args, { stderr: 'inherit' });
  return stdout;
}

// dbclient-fetch assumes $HOME/bin is in the PATH
async function setupPath() {
  await execShell('mkdir -p "$HOME/bin"');
  // eslint-disable-next-line no-process-env
  process.env.PATH = process.env.HOME + '/bin' + ':' + process.env.PATH;
}

function installPostgresClient(configuration) {
  return exec('dbclient-fetcher', [ 'pgsql', configuration.PG_CLIENT_VERSION ]);
}

async function pgclientSetup(configuration) {
  await setupPath();
  return installPostgresClient(configuration);
}

function dropCurrentObjects(configuration) {
  // TODO: pass DATABASE_URL by argument
  return exec('psql', [ configuration.DATABASE_URL, ' --echo-all', '--set', 'ON_ERROR_STOP=on', '--command', 'DROP OWNED BY CURRENT_USER CASCADE' ]);
}

async function dropCurrentObjectsButKesAndAnswers(configuration) {
  const dropTableQuery = await execStdOut('psql', [ configuration.DATABASE_URL, '--tuples-only', '--command', 'select string_agg(\'drop table "\' || tablename || \'" CASCADE\', \'; \') from pg_tables where schemaname = \'public\' and tablename not in (\'knowledge-elements\', \'answers\');' ]);
  const dropFunction = await execStdOut('psql', [ configuration.DATABASE_URL, '--tuples-only', '--command', 'select string_agg(\'drop function "\' || proname || \'"\', \'; \') FROM pg_proc pp INNER JOIN pg_roles pr ON pp.proowner = pr.oid WHERE pr.rolname = current_user ' ]);
  await exec('psql', [ configuration.DATABASE_URL, '--set', 'ON_ERROR_STOP=on', '--echo-all' , '--command', dropTableQuery ]);
  return exec('psql', [ configuration.DATABASE_URL, '--set', 'ON_ERROR_STOP=on', '--echo-all' , '--command', dropFunction ]);
}

async function writeListFileForReplication({ backupFile, configuration }) {
  const backupObjectList = await execStdOut('pg_restore', [ backupFile, '-l' ]);
  const backupObjectLines = backupObjectList.split('\n');
  const filteredObjectLines = _filterObjectLines(backupObjectLines, configuration);
  fs.writeFileSync(RESTORE_LIST_FILENAME, filteredObjectLines.join('\n'));
}

async function restoreBackup({ backupFile, databaseUrl, configuration }) {
  logger.info('Start restore');

  try {
    const verboseOptions = process.env.NODE_ENV === 'test' ? [] : ['--verbose'];
    await writeListFileForReplication({ backupFile, configuration });
    // TODO: pass DATABASE_URL by argument
    await exec('pg_restore', [
      ...verboseOptions,
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

async function createBackup(configuration) {
  logger.info('Start create Backup');
  const backupFilename = './dump.pgsql';

  const excludeOptions = configuration.RESTORE_ANSWERS_AND_KES === 'true'
    ? []
    : [
      '--exclude-table', 'knowledge-elements',
      '--exclude-table', 'answers',
    ];
  const verboseOptions = process.env.NODE_ENV === 'test' ? [] : ['--verbose'];

  await exec('pg_dump', [
    '--clean',
    '--if-exists',
    '--format', 'c',
    '--dbname', configuration.SOURCE_DATABASE_URL,
    '--no-owner',
    '--no-privileges',
    '--no-comments',
    '--exclude-schema',
    'information_schema',
    '--exclude-schema', '\'^pg_*\'',
    '--file', backupFilename,
    ...verboseOptions,
    ...excludeOptions,
  ]);
  logger.info('End create Backup');
  return backupFilename;
}

async function dropObjectAndRestoreBackup(backupFile, configuration) {
  logger.info('Start drop Objects AndRestoreBackup');
  if (configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY && configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'true') {
    await dropCurrentObjectsButKesAndAnswers(configuration);
  } else {
    await dropCurrentObjects(configuration);
  }
  logger.info('End drop Objects AndRestoreBackup');

  logger.info('Start restore Backup');
  await restoreBackup({ backupFile, databaseUrl: configuration.DATABASE_URL, configuration });
  logger.info('End restore Backup');
}

async function importAirtableData(configuration) {
  logger.info('airtableData.fetchAndSaveData - Started');
  await airtableData.fetchAndSaveData(configuration);
  logger.info('airtableData.fetchAndSaveData - Ended');
}

async function addEnrichment(configuration) {
  try {
    logger.info('enrichment.add - Started');
    await enrichment.add(configuration);
    logger.info('enrichment.add - Ended');
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function backupAndRestore(configuration) {
  const backup = await createBackup(configuration);
  await dropObjectAndRestoreBackup(backup, configuration);
}

async function fullReplicationAndEnrichment(configuration) {

  logger.info('Start import and enrichment');

  logger.info('Import data from API database');
  await backupAndRestore(configuration);

  logger.info('Enrich imported data');
  await addEnrichment(configuration);

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
  addEnrichment,
  backupAndRestore,
  createBackup,
  dropObjectAndRestoreBackup,
  fullReplicationAndEnrichment,
  importAirtableData,
  pgclientSetup,
  restoreBackup
};
