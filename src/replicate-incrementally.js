'use strict';

const { execSync } = require('child_process');
const execa = require('execa');
const logger = require('../logger');

async function execStdOut(cmd, args) {
  const { stdout } = await execa(cmd, args, { stderr: 'inherit' });
  return stdout;
}

async function run(configuration) {

  if (!configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY || configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'false') {
    logger.info('Exit because RESTORE_ANSWERS_AND_KES_INCREMENTALLY is falsy');
    return;
  }

  logger.info('Start incremental replication');

  const maxAnswerIdStr = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM answers']);
  const answersLastRecordIndexTargetBeforeReplication = parseInt(maxAnswerIdStr);
  logger.info('Answers last record index target ' + answersLastRecordIndexTargetBeforeReplication);

  if (isNaN(answersLastRecordIndexTargetBeforeReplication)) {
    throw new Error('Answers table must not be empty on target database');
  }

  const maxKEIdStr = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']);
  const kELastRecordIndexTargetBeforeReplication = parseInt(maxKEIdStr);
  logger.info('KE last record index target ' + kELastRecordIndexTargetBeforeReplication);

  if (isNaN(kELastRecordIndexTargetBeforeReplication)) {
    throw new Error('Knowledge-elements table must not be empty on target database');
  }

  logger.info('Start COPY FROM/TO through STDIN/OUT');

  const answersSqlCopyCommand = `
    psql \\
        ${configuration.SOURCE_DATABASE_URL} \\
        --command "\\copy (SELECT * FROM answers WHERE id>${answersLastRecordIndexTargetBeforeReplication}) to stdout" | \\
    psql \\
        ${configuration.TARGET_DATABASE_URL} \\
        --command "\\copy answers from stdin"`;

  const answersCopyMessage = execSync(answersSqlCopyCommand);
  logger.info('Answers table copy returned: ' + answersCopyMessage);

  const kesSqlCopyCommand = `
    psql \\
        ${configuration.SOURCE_DATABASE_URL} \\
        --command "\\copy (SELECT * FROM \\"knowledge-elements\\" WHERE id>${kELastRecordIndexTargetBeforeReplication}) to stdout" | \\
    psql \\
        ${configuration.TARGET_DATABASE_URL} \\
        --command "\\copy \\"knowledge-elements\\" from stdin"`;

  const kECopyMessage = execSync(kesSqlCopyCommand);
  logger.info('Knowledge-elements table copy returned: ' + kECopyMessage);
  
  const maxAnswerIdStrAfterReplication = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM answers']);
  const answersLastRecordIndexTargetAfterReplication = parseInt(maxAnswerIdStrAfterReplication);
  logger.info('Answers last record index target after replication ' + answersLastRecordIndexTargetAfterReplication);

  logger.info('Total of Answers imported ' + (answersLastRecordIndexTargetAfterReplication - answersLastRecordIndexTargetBeforeReplication));

  const maxKEIdStrAfterReplication = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']);
  const kELastRecordIndexTargetAfterReplication = parseInt(maxKEIdStrAfterReplication);
  logger.info('KE last record index target after replication ' + kELastRecordIndexTargetAfterReplication);

  logger.info('Total of KE imported ' + (kELastRecordIndexTargetAfterReplication - kELastRecordIndexTargetBeforeReplication));

  logger.info('Incremental replication done');
}

module.exports = {
  run
};
