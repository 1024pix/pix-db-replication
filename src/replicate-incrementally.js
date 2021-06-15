'use strict';

const { execSync } = require('child_process');
const execa = require('execa');

const logger = require('./logger');

async function execStdOut(cmd, args) {
  const { stdout } = await execa(cmd, args, { stderr: 'inherit' });
  return stdout;
}

async function run(configuration) {

  if (!configuration.RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY || configuration.RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY === 'false') {
    logger.info('Exit because RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY is falsy');
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

  const maxKESnapshotsIdStr = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-element-snapshots"']);
  const kESnapshotsLastRecordIndexTargetBeforeReplication = parseInt(maxKESnapshotsIdStr);
  logger.info('KE last record index target ' + kESnapshotsLastRecordIndexTargetBeforeReplication);

  if (isNaN(kESnapshotsLastRecordIndexTargetBeforeReplication)) {
    throw new Error('Knowledge-element-snapshots table must not be empty on target database');
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

  const keSnapshotSqlCopyCommand = `
    psql \\
        ${configuration.SOURCE_DATABASE_URL} \\
        --command "\\copy (SELECT * FROM \\"knowledge-element-snapshots\\" WHERE id>${kESnapshotsLastRecordIndexTargetBeforeReplication}) to stdout" | \\
    psql \\
        ${configuration.TARGET_DATABASE_URL} \\
        --command "\\copy \\"knowledge-element-snapshots\\" from stdin"`;

  const kESnapshotCopyMessage = execSync(keSnapshotSqlCopyCommand);
  logger.info('Knowledge-element-snapshots table copy returned: ' + kESnapshotCopyMessage);

  const maxAnswerIdStrAfterReplication = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM answers']);
  const answersLastRecordIndexTargetAfterReplication = parseInt(maxAnswerIdStrAfterReplication);
  logger.info('Answers last record index target after replication ' + answersLastRecordIndexTargetAfterReplication);

  logger.info('Total of Answers imported ' + (answersLastRecordIndexTargetAfterReplication - answersLastRecordIndexTargetBeforeReplication));

  const maxKEIdStrAfterReplication = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']);
  const kELastRecordIndexTargetAfterReplication = parseInt(maxKEIdStrAfterReplication);
  logger.info('KE last record index target after replication ' + kELastRecordIndexTargetAfterReplication);

  logger.info('Total of KE imported ' + (kELastRecordIndexTargetAfterReplication - kELastRecordIndexTargetBeforeReplication));

  const maxKESnapshotsIdStrAfterReplication = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-elements"']);
  const kESnapshotsLastRecordIndexTargetAfterReplication = parseInt(maxKESnapshotsIdStrAfterReplication);
  logger.info('KE Snapshots last record index target after replication ' + kESnapshotsLastRecordIndexTargetAfterReplication);

  logger.info('Total of KE Snapshots imported ' + (kESnapshotsLastRecordIndexTargetAfterReplication - kESnapshotsLastRecordIndexTargetBeforeReplication));

  logger.info('Incremental replication done');
}

module.exports = {
  run
};
