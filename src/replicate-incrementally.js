'use strict';

const { execSync } = require('child_process');

const execa = require('execa');
const logger = require('../logger');

function execSyncStdOut(cmd, args) {
  return execa.sync(cmd, args, { stderr: 'inherit' }).stdout;
}

async function run() {

  if (!process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY || process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'false') {
    process.exit(0);
  }

  const sourceDatabaseURL = process.env.SOURCE_DATABASE_URL;
  const targetDatabaseURL = process.env.DATABASE_URL;

  logger.info('Start incremental replication');

  const answersLastRecordIndexTarget = parseInt(execSyncStdOut('psql', [targetDatabaseURL, '--tuples-only', '--command', 'SELECT MAX(id) FROM answers']));
  if (isNaN(answersLastRecordIndexTarget)) {
    logger.error('Answers must not be empty');
    process.exit(1);
  }

  const kELastRecordIndexTarget = parseInt(execSyncStdOut('psql', [targetDatabaseURL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']));
  if (isNaN(kELastRecordIndexTarget)) {
    logger.error('KnowledgeElements must not be empty');
    process.exit(1);
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
  logger.info('answers copy returned: ' + answersCopyMessage);

  const kesSqlCopyCommand = `
    psql \\
        ${sourceDatabaseURL} \\
        --command "\\copy (SELECT * FROM \\"knowledge-elements\\" WHERE id>${kELastRecordIndexTarget}) to stdout" | \\
    psql \\
        ${targetDatabaseURL} \\
        --command "\\copy \\"knowledge-elements\\" from stdin"`;

  const kECopyMessage = execSync(kesSqlCopyCommand);
  logger.info('KE copy returned: ' + kECopyMessage);

  logger.info('Incremental replication done');
}

module.exports = {
  run
};
