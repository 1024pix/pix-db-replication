"use strict";

const PG_CLIENT_VERSION = process.env.PG_CLIENT_VERSION || '10.4';
const PG_RESTORE_JOBS = parseInt(process.env.PG_RESTORE_JOBS, 10) || 4;
const execa = require('execa');
const fs = require('fs');
const retry = require('p-retry');
const airtableData = require('./airtable-data');
const enrichment = require('./enrichment');

function shellSync(cmdline) {
  execa.shellSync(cmdline, { stdio: 'inherit' });
}

function execSync(cmd, args) {
  execa.sync(cmd, args, { stdio: 'inherit' });
}

function execSyncStdOut(cmd, args) {
  return execa.sync(cmd, args, { stderr: 'inherit' }).stdout;
}

function retryFunction(fn) {
  return retry(fn, {
    onFailedAttempt: error => {
      console.error(error);
    },
    retries: process.env.MAX_RETRY_NUMBER || 10
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
  } catch(e) {
    console.error("Could not extract add-on ID from:\n", addonsOutput);
    throw e;
  }
}

function getBackupId({ addonId }) {
  const backupsOutput = execSyncStdOut('scalingo', [ '--addon', addonId, 'backups' ]);
  try {
    const { backupId } = backupsOutput.match(/^\|\s*(?<backupId>[^ |]+).*done/m).groups;

    return backupId;
  } catch(e) {
    console.error("Could not extract backup ID from:\n", backupsOutput);
    throw e;
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

// Omit COMMENT objects from backup as we are not allowed to update comments on extensions
function createRestoreList({ backupFile }) {
  const backupObjectList = execSyncStdOut('pg_restore', [ backupFile, '-l' ]);
  const backupObjectLines = backupObjectList.split('\n');
  const nonCommentBackupObjectLines = backupObjectLines.filter((line) => !/ COMMENT /.test(line));
  const restoreListFile = 'restore.list';
  fs.writeFileSync(restoreListFile, nonCommentBackupObjectLines.join('\n'));
  return restoreListFile;
}

function restoreBackup({ backupFile }) {
  try {
    const restoreListFile = createRestoreList({ backupFile });
    execSync('pg_restore', [
               '--verbose',
               '--jobs', PG_RESTORE_JOBS,
               '--no-owner',
               '--use-list', restoreListFile,
               '-d', process.env.DATABASE_URL,
               backupFile
             ]);
  } finally {
    fs.unlinkSync(backupFile);
  }

  console.log("Restore done");
}

async function downloadAndRestoreLatestBackup() {
  const addonId = await retryFunction(getPostgresAddonId);
  console.log("Add-on ID:", addonId);

  const backupId = await retryFunction(() => getBackupId({ addonId }));
  console.log("Backup ID:", backupId);

  const backupFile = await retryFunction(() => {
    const compressedBackup = downloadBackup({ addonId, backupId });
    return extractBackup({ compressedBackup });
  });

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
  await downloadAndRestoreLatestBackup();

  await importAirtableData();

  await addEnrichment();

  console.log("Full replication and enrichment done");
}

module.exports = {
  setupPath,
  installScalingoCli,
  installPostgresClient,
  scalingoSetup,
  getPostgresAddonId,
  getBackupId,
  downloadBackup,
  extractBackup,
  dropCurrentObjects,
  createRestoreList,
  restoreBackup,
  downloadAndRestoreLatestBackup,
  importAirtableData,
  addEnrichment,
  fullReplicationAndEnrichment,
}
