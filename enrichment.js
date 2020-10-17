'use strict';

const { runDBOperation } = require('./db-connection');

async function add() {
  await runDBOperation(async (client) => {
    const restoreAnswersAndKes = process.env.RESTORE_ANSWERS_AND_KES === 'true';
    if (restoreAnswersAndKes) {
      await client.query('CREATE INDEX "knowledge-elements_createdAt_idx" on "knowledge-elements" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
      await client.query('CREATE INDEX "answers_challengeId_idx" on "answers" ("challengeId")');
    }
    await client.query('CREATE INDEX "users_createdAt_idx" on "users" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
    await client.query('CREATE VIEW students AS SELECT * FROM "schooling-registrations"');
  });
}

module.exports = {
  add
};
