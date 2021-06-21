'use strict';

const execa = require('execa');

const logger = require('./logger');

async function execStdOut(cmd, args) {
  const { stdout } = await execa(cmd, args, { stderr: 'inherit' });
  return stdout;
}

function escapeSQLIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function run(configuration) {

  if (!configuration.RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY || configuration.RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY === 'false') {
    logger.info('Exit because RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY is falsy');
    return;
  }

  logger.info('Start incremental replication');

  const maxKESnapshotsIdStr = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', 'SELECT MAX(id) FROM "knowledge-element-snapshots"']);
  const kESnapshotsLastRecordIndexTargetBeforeReplication = parseInt(maxKESnapshotsIdStr);
  logger.info('KE last record index target ' + kESnapshotsLastRecordIndexTargetBeforeReplication);

  if (isNaN(kESnapshotsLastRecordIndexTargetBeforeReplication)) {
    throw new Error('Knowledge-element-snapshots table must not be empty on target database');
  }

  logger.info('Start COPY FROM/TO through STDIN/OUT');

  const tablesAndLastRecordIndex = [
    {
      name: 'knowledge-element-snapshots',
      lastRecordIndex: kESnapshotsLastRecordIndexTargetBeforeReplication,
    },
  ];

  for (const table of tablesAndLastRecordIndex) {
    const copyToStdOutArgs = [
      configuration.SOURCE_DATABASE_URL,
      '--command',
      `\\copy (SELECT * FROM ${escapeSQLIdentifier(table.name)} WHERE id > ${table.lastRecordIndex}) to stdout`
    ];
    const copyFromStdInArgs = [
      configuration.TARGET_DATABASE_URL,
      '--command',
      `\\copy ${escapeSQLIdentifier(table.name)} from stdin`
    ];
    const copyToStdOutProcess = execa('psql', copyToStdOutArgs, {
      stdin: 'ignore', stdout: 'pipe', stderr: 'inherit',
      buffer: false // disable execa's buffering otherwise it interferes with the transfer
    });
    const copyFromStdInProcess = execa('psql', copyFromStdInArgs, {
      stdin: copyToStdOutProcess.stdout,
      all: true // join stdout and stderr
    });

    const [ , copyFromStdInResult ] = await Promise.all([ copyToStdOutProcess, copyFromStdInProcess ]);

    logger.info(`${table.name} table copy returned: ` + copyFromStdInResult.all);

    const maxIdStrAfterReplication = await execStdOut('psql', [
      configuration.TARGET_DATABASE_URL,
      '--tuples-only',
      '--command',
      `SELECT MAX(id) FROM ${escapeSQLIdentifier(table.name)}`
    ]);
    const lastRecordIndexTargetAfterReplication = parseInt(maxIdStrAfterReplication);
    logger.info(`${table.name} last record index target after replication ` + lastRecordIndexTargetAfterReplication);
    logger.info(`Total of ${table.name} imported ` + (lastRecordIndexTargetAfterReplication - table.lastRecordIndex));
  }

  logger.info('Incremental replication done');
}

module.exports = {
  run
};
