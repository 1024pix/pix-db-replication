/* eslint-disable no-process-env */
'use strict';

const execa = require('execa');
const fs = require('fs');

const learningContent = require('./learning-content');
const enrichment = require('./enrichment');
const logger = require('./logger');
const toPairs = require('lodash/toPairs');

const RESTORE_LIST_FILENAME = 'restore.list';

const REPLICATION_MODE = {
  INCREMENTAL: 'incremental',
  TO_EXCLUDE: 'none',
};

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
  if (process.env.NODE_ENV === 'production') {
    await setupPath();
    await installPostgresClient(configuration);
  }
}

async function dropCurrentObjects(configuration) {
  // TODO: pass DATABASE_URL by argument
  const tablesToDrop = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL, REPLICATION_MODE.TO_EXCLUDE]);
  if (tablesToDrop.length > 0) {
    return dropCurrentObjectsExceptTables(configuration.DATABASE_URL, tablesToDrop);
  }
  else return exec('psql', [ configuration.DATABASE_URL, ' --echo-all', '--set', 'ON_ERROR_STOP=on', '--command', 'DROP OWNED BY CURRENT_USER CASCADE' ]);
}

async function dropCurrentObjectsExceptTables(databaseUrl, tableNames) {
  const tableNamesForQuery = tableNames.map((tableName) => `'${tableName}'`).join(',');
  const dropTableQuery = await execStdOut('psql', [ databaseUrl, '--tuples-only', '--command', `select string_agg('drop table "' || tablename || '" CASCADE', '; ') from pg_tables where schemaname = 'public' and tablename not in (${tableNamesForQuery});` ]);
  const dropFunction = await execStdOut('psql', [ databaseUrl, '--tuples-only', '--command', 'select string_agg(\'drop function "\' || proname || \'"\', \'; \') FROM pg_proc pp INNER JOIN pg_roles pr ON pp.proowner = pr.oid WHERE pr.rolname = current_user ' ]);
  await exec('psql', [ databaseUrl, '--set', 'ON_ERROR_STOP=on', '--echo-all', '--command', dropTableQuery ]);
  return exec('psql', [ databaseUrl, '--set', 'ON_ERROR_STOP=on', '--echo-all', '--command', dropFunction ]);
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
      backupFile,
    ]);

  } finally {
    fs.unlinkSync(backupFile);
  }

  logger.info('Restore done');
}

async function createBackup(configuration) {
  logger.info('Start create Backup');
  const backupFilename = './dump.pgsql';

  let excludeOptions = [];
  const tablesToExcludeFromBackup = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL, REPLICATION_MODE.TO_EXCLUDE]);
  if (tablesToExcludeFromBackup.length > 0) {
    excludeOptions = tablesToExcludeFromBackup.reduce((excludeTablesOptions, tableName) => [...excludeTablesOptions, '--exclude-table', tableName], []);
  }

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
  await dropCurrentObjects(configuration);
  logger.info('End drop Objects AndRestoreBackup');

  logger.info('Start restore Backup');
  await restoreBackup({ backupFile, databaseUrl: configuration.DATABASE_URL, configuration });
  logger.info('End restore Backup');
}

async function importLearningContent(configuration) {
  logger.info('learningContent.fetchAndSaveData - Started');
  await learningContent.fetchAndSaveData(configuration);
  logger.info('learningContent.fetchAndSaveData - Ended');
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
  const patternsToFilter = [' COMMENT '];

  const restoreFkConstraints = configuration.RESTORE_FK_CONSTRAINTS === 'true';

  if (!restoreFkConstraints) {
    patternsToFilter.push('FK CONSTRAINT');
  }

  const tablesToFilterFromBackupRestore = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL, REPLICATION_MODE.TO_EXCLUDE]);
  if (tablesToFilterFromBackupRestore.length > 0) {
    const prepareTableNameForRegex = (tableName) => tableName.split(/[-_]/).join('[-_]');
    const tableNamesForRegex = tablesToFilterFromBackupRestore.map(prepareTableNameForRegex);
    patternsToFilter.push(...tableNamesForRegex);
  }

  const regexp = patternsToFilter.join('|');

  return objectLines.filter((line) => !new RegExp(regexp).test(line));
}

function getTablesWithReplicationModes(configuration, modes = []) {
  const tablePairs = toPairs(configuration.BACKUP_MODE);
  return tablePairs
    .filter(([_, mode]) => modes.includes(mode))
    .map(([tableName, _]) => tableName);
}

module.exports = {
  addEnrichment,
  backupAndRestore,
  createBackup,
  dropObjectAndRestoreBackup,
  fullReplicationAndEnrichment,
  getTablesWithReplicationModes,
  importLearningContent,
  pgclientSetup,
  restoreBackup,
  REPLICATION_MODE,
};
