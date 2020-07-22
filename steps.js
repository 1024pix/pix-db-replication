'use strict';

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

function shellSync(cmdline) {
  execa.shellSync(cmdline, { stdio: 'inherit' });
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

function _pg_restore({ backupFile, sections }) {
  execSync('pg_restore', [
    '--verbose',
    '--jobs', PG_RESTORE_JOBS,
    '--no-owner',
    '--no-comments',
    '--schema', 'public',
    ...(sections.map((s) => `--section=${s}`)),
    '-d', process.env.DATABASE_URL,
    backupFile
  ]);
}

function _makeAllTablesUnlogged() {
  execSync('psql', [ process.env.DATABASE_URL,
    '-c', '\\gexec', '-c',
    `SELECT format('ALTER TABLE %I SET UNLOGGED', table_name)
     FROM information_schema.tables
     WHERE table_schema='public' AND table_type='BASE TABLE'`
  ]);
}

function restoreBackup({ backupFile }) {
  logger.info('Start restore');

  try {
    _pg_restore({ backupFile, sections: ['pre-data'] });
    _makeAllTablesUnlogged();
    _pg_restore({ backupFile, sections: ['data', 'post-data'] });
  } finally {
    fs.unlinkSync(backupFile);
  }

  logger.info('Restore done');
}

async function downloadAndRestoreLatestBackup() {
  const addonId = await getPostgresAddonId();
  logger.info('Add-on ID: ' + addonId);

  const backupId = getBackupId({ addonId });
  logger.info('Backup ID: ' + backupId);

  const compressedBackup = downloadBackup({ addonId, backupId });
  const backupFile = extractBackup({ compressedBackup });

  dropCurrentObjects();

  restoreBackup({ backupFile });
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
    await retryFunction(downloadAndRestoreLatestBackup, MAX_RETRY_COUNT);
  } finally {
    clearTimeout(retriesAlarm);
  }

  await importAirtableData();

  await addEnrichment();

  logger.info('Full replication and enrichment done');
}

module.exports = {
  addEnrichment,
  downloadAndRestoreLatestBackup,
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
