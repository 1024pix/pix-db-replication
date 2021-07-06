'use strict';

const execa = require('execa');
const toPairs = require('lodash/toPairs');

const logger = require('./logger');

async function execStdOut(cmd, args) {
  const { stdout } = await execa(cmd, args, { stderr: 'inherit' });
  return stdout;
}

function escapeSQLIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function run(configuration) {
  const incrementalTables = _getIncrementalTables(configuration);
  if (incrementalTables.length === 0) {
    logger.info('Exit because BACKUP_MODE is not incremental');
    return;
  }

  logger.info('Start incremental replication');

  const tablesAndLastRecordIndex = [];
  for (const table of incrementalTables) {
    const req = `SELECT MAX(id) FROM "${table}"`;
    const maxIdStr = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', req]);
    const lastRecordIndexTargetBeforeReplication = parseInt(maxIdStr);
    logger.info(`${table} last record index target ${lastRecordIndexTargetBeforeReplication}`);

    if (isNaN(lastRecordIndexTargetBeforeReplication)) {
      throw new Error(`${table} table must not be empty on target database`);
    }

    tablesAndLastRecordIndex.push({
      name: table,
      lastRecordIndex: lastRecordIndexTargetBeforeReplication,
    });

  }

  logger.info('Start COPY FROM/TO through STDIN/OUT');

  for (const table of tablesAndLastRecordIndex) {
    const copyToStdOutArgs = [
      configuration.SOURCE_DATABASE_URL,
      '--command',
      `\\copy (SELECT * FROM ${escapeSQLIdentifier(table.name)} WHERE id > ${table.lastRecordIndex}) to stdout`,
    ];
    const copyFromStdInArgs = [
      configuration.TARGET_DATABASE_URL,
      '--command',
      `\\copy ${escapeSQLIdentifier(table.name)} from stdin`,
    ];
    const copyToStdOutProcess = execa('psql', copyToStdOutArgs, {
      stdin: 'ignore', stdout: 'pipe', stderr: 'inherit',
      buffer: false, // disable execa's buffering otherwise it interferes with the transfer
    });
    const copyFromStdInProcess = execa('psql', copyFromStdInArgs, {
      stdin: copyToStdOutProcess.stdout,
      all: true, // join stdout and stderr
    });

    const [ , copyFromStdInResult ] = await Promise.all([ copyToStdOutProcess, copyFromStdInProcess ]);

    logger.info(`${table.name} table copy returned: ` + copyFromStdInResult.all);

    const maxIdStrAfterReplication = await execStdOut('psql', [
      configuration.TARGET_DATABASE_URL,
      '--tuples-only',
      '--command',
      `SELECT MAX(id) FROM ${escapeSQLIdentifier(table.name)}`,
    ]);
    const lastRecordIndexTargetAfterReplication = parseInt(maxIdStrAfterReplication);
    logger.info(`${table.name} last record index target after replication ` + lastRecordIndexTargetAfterReplication);

    logger.info(`Total of ${table.name} imported ` + (lastRecordIndexTargetAfterReplication - table.lastRecordIndex));
  }

  logger.info('Incremental replication done');
}

function _getIncrementalTables(configuration) {
  const tablePairs = toPairs(configuration.BACKUP_MODE);
  return tablePairs
    .filter(([_, mode]) => mode === 'incremental')
    .map(([tableName, _]) => tableName);
}

module.exports = {
  run,
};
