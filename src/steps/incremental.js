'use strict';

import { execa } from 'execa';
import { execStdOut } from '../exec.js';
import { getTablesWithReplicationModes, REPLICATION_MODE } from '../config/index.js';

import { logger } from '../logger.js';

function escapeSQLIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function _hasIncrementalTables(incrementalTables) {
  return incrementalTables.length > 0;
}

async function run(configuration) {
  const incrementalTables = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL]);
  if (!_hasIncrementalTables(incrementalTables)) {
    logger.info('No incremental tables configured');
    return;
  }

  logger.info('Start incremental replication');

  const tablesAndLastRecordIndex = [];
  for (const table of incrementalTables) {
    const req = `SELECT MAX(id) FROM "${table}"`;
    const maxIdStr = await execStdOut('psql', [configuration.TARGET_DATABASE_URL, '--tuples-only', '--command', req]);
    const lastRecordIndexTargetBeforeReplication = parseInt(maxIdStr);
    logger.info(
      {
        last_record_index_before_replication: lastRecordIndexTargetBeforeReplication,
        table_name: table,
      },
      `${table} last record index target ${lastRecordIndexTargetBeforeReplication}`,
    );

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

    logger.info(
      {
        last_record_index_after_replication: lastRecordIndexTargetAfterReplication,
        table_name: `${table.name}`,
      },
      `${table.name} last record index target after replication ` + lastRecordIndexTargetAfterReplication,
    );

    const totalRecordsReplicated = (lastRecordIndexTargetAfterReplication - table.lastRecordIndex);
    logger.info(
      {
        last_record_index_before_replication: table.lastRecordIndex,
        last_record_index_after_replication: lastRecordIndexTargetAfterReplication,
        total_records_replicated: totalRecordsReplicated,
        table_name: `${table.name}`,
      },
      `Total of ${table.name} imported ` + totalRecordsReplicated,
    );
  }

  logger.info('Incremental replication done');
}

export {
  run,
};
