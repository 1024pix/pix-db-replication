'use strict';

const { runDBOperation } = require('./db-connection');
const logger = require('./logger');

async function add(configuration) {
  await runDBOperation(async (client) => {
    const restoreAnswersAndKes = configuration.RESTORE_ANSWERS_AND_KES === 'true';
    if (restoreAnswersAndKes) {
      logger.info('CREATE INDEX "knowledge-elements_createdAt_idx" - Started');
      await client.query('CREATE INDEX "knowledge-elements_createdAt_idx" on "knowledge-elements" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
      logger.info('CREATE INDEX "knowledge-elements_createdAt_idx" - Ended');

      logger.info('CREATE INDEX "answers_challengeId_idx" - Started');
      await client.query('CREATE INDEX "answers_challengeId_idx" on "answers" ("challengeId")');
      logger.info('CREATE INDEX "answers_challengeId_idx" - Ended');
    }
    logger.info('CREATE INDEX "users_createdAt_idx" - Started');
    await client.query('CREATE INDEX "users_createdAt_idx" on "users" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
    logger.info('CREATE INDEX "users_createdAt_idx" - Ended');

    logger.info('CREATE VIEW students - Started');
    await client.query('CREATE VIEW students AS SELECT * FROM "schooling-registrations"');
    logger.info('CREATE VIEW students - Ended');

  }, configuration);
}

module.exports = {
  add
};
