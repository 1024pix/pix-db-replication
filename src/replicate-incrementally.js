'use strict';

const { execSync } = require('child_process');
const execa = require('execa');
const logger = require('../logger');

function execSyncStdOut(cmd, args) {
  return execa.sync(cmd, args, { stderr: 'inherit' }).stdout;
}

function run(configuration) {

  if (!configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY || configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'false') {
    return;
  }

  logger.info('Start incremental replication');

  const answersLastRecordIndexTarget = parseInt(execSyncStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM answers']));
  if (isNaN(answersLastRecordIndexTarget)) {
    throw new Error('Answers table must not be empty on target database');
  }

  const kELastRecordIndexTarget = parseInt(execSyncStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']));
  if (isNaN(kELastRecordIndexTarget)) {
    throw new Error('Knowledge-elements table must not be empty on target database');
  }

  logger.info('Start COPY FROM/TO through STDIN/OUT');

  const answersSqlCopyCommand = `
    psql \\
        ${configuration.SOURCE_DATABASE_URL} \\
        --command "\\copy (SELECT * FROM answers WHERE id>${answersLastRecordIndexTarget}) to stdout" | \\
    psql \\
        ${configuration.TARGET_DATABASE_URL} \\
        --command "\\copy answers from stdin"`;

  const answersCopyMessage = execSync(answersSqlCopyCommand);
  logger.info('Answers table copy returned: ' + answersCopyMessage);

  const kesSqlCopyCommand = `
    psql \\
        ${configuration.SOURCE_DATABASE_URL} \\
        --command "\\copy (SELECT * FROM \\"knowledge-elements\\" WHERE id>${kELastRecordIndexTarget}) to stdout" | \\
    psql \\
        ${configuration.TARGET_DATABASE_URL} \\
        --command "\\copy \\"knowledge-elements\\" from stdin"`;

  const kECopyMessage = execSync(kesSqlCopyCommand);
  logger.info('Knowledge-elements table copy returned: ' + kECopyMessage);

  logger.info('Incremental replication done');
}

module.exports = {
  run
};
