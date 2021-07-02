'use strict';

const { runDBOperation } = require('./db-connection');
const logger = require('./logger');
const toPairs = require('lodash/toPairs');

async function add(configuration) {
  await runDBOperation(async (client) => {
    const incrementalTables = _getIncrementalTables(configuration);
    if (!incrementalTables.includes('knowledge-elements')) {
      logger.info('CREATE INDEX "knowledge-elements_createdAt_idx" - Started');
      await client.query('CREATE INDEX "knowledge-elements_createdAt_idx" on "knowledge-elements" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
      logger.info('CREATE INDEX "knowledge-elements_createdAt_idx" - Ended');

    }
    if (!incrementalTables.includes('knowledge-element-snapshots')) {
      logger.info('CREATE INDEX "knowledge-element-snapshots_snappedAt_idx" - Started');
      await client.query('CREATE INDEX "knowledge-element-snapshots_snappedAt_idx" on "knowledge-element-snapshots" (cast("snappedAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
      logger.info('CREATE INDEX "knowledge-element-snapshots_snappedAt_idx" - Ended');

    }
    if (!incrementalTables.includes('answers')) {
      logger.info('CREATE INDEX "answers_challengeId_idx" - Started');
      await client.query('CREATE INDEX "answers_challengeId_idx" on "answers" ("challengeId")');
      logger.info('CREATE INDEX "answers_challengeId_idx" - Ended');
    }

    if (!incrementalTables.includes('users')) {
      logger.info('CREATE INDEX "users_createdAt_idx" - Started');
      await client.query('CREATE INDEX "users_createdAt_idx" on "users" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
      logger.info('CREATE INDEX "users_createdAt_idx" - Ended');
    }
    if (!incrementalTables.includes('schooling-registrations')) {
      logger.info('CREATE VIEW students - Started');
      await client.query('CREATE VIEW students AS SELECT * FROM "schooling-registrations"');
      logger.info('CREATE VIEW students - Ended');
    }
  }, configuration);
}

function _getIncrementalTables(configuration) {
  const tablePairs = toPairs(configuration.BACKUP_MODE);
  return tablePairs
    .filter(([_, mode]) => mode === 'incremental' || mode === 'none')
    .map(([tableName, _]) => tableName);
}

module.exports = {
  add,
};
