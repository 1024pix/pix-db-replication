"use strict";

const { runDBOperation } = require('./db-connection');

async function add() {
  await runDBOperation(async (client) => {
    await client.query('CREATE INDEX "knowledge-elements_createdAt_idx" on "knowledge-elements" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
    await client.query('CREATE INDEX "users_createdAt_idx" on "users" (cast("createdAt" AT TIME ZONE \'UTC+1\' as date) DESC)');
    await client.query('CREATE VIEW students AS SELECT * FROM "schooling-registrations"');
  });
}

module.exports = {
  add
}