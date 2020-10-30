'use strict';

const { execSync } = require('child_process');

const execa = require('execa');
const logger = require('../logger');

function execSyncStdOut(cmd, args) {
  return execa.sync(cmd, args, { stderr: 'inherit' }).stdout;
}

function run() {

  if (!process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY || process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'false') {
    return;
  }

  const sourceDatabaseURL = process.env.SOURCE_DATABASE_URL;
  const targetDatabaseURL = process.env.TARGET_DATABASE_URL;

  logger.info('Start incremental replication');

  const answersLastRecordIndexTarget = parseInt(execSyncStdOut('psql', [targetDatabaseURL, '--tuples-only', '--command', 'SELECT MAX(id) FROM answers']));
  if (isNaN(answersLastRecordIndexTarget)) {
    throw new Error('Answers table must not be empty on target database');
  }

  const kELastRecordIndexTarget = parseInt(execSyncStdOut('psql', [targetDatabaseURL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']));
  if (isNaN(kELastRecordIndexTarget)) {
    throw new Error('Knowledge-elements table must not be empty on target database');
  }

  logger.info('Start COPY FROM/TO through STDIN/OUT');

  const answersSqlCopyCommand = `
    psql \\
        ${sourceDatabaseURL} \\
        --command "\\copy (SELECT * FROM answers WHERE id>${answersLastRecordIndexTarget}) to stdout" | \\
    psql \\
        ${targetDatabaseURL} \\
        --command "\\copy answers from stdin"`;

  const answersCopyMessage = execSync(answersSqlCopyCommand);
  logger.info('Answers table copy returned: ' + answersCopyMessage);

  const kesSqlCopyCommand = `
    psql \\
        ${sourceDatabaseURL} \\
        --command "\\copy (SELECT * FROM \\"knowledge-elements\\" WHERE id>${kELastRecordIndexTarget}) to stdout" | \\
    psql \\
        ${targetDatabaseURL} \\
        --command "\\copy \\"knowledge-elements\\" from stdin"`;

  const kECopyMessage = execSync(kesSqlCopyCommand);
  logger.info('Knowledge-elements table copy returned: ' + kECopyMessage);

  logger.info('Incremental replication done');
}

module.exports = {
  run
};
