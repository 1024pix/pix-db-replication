"use strict";

const { Client } = require('pg');

async function _withDBClient(callback) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

async function add() {
  return _withDBClient(async (client) => {
    const query = `CREATE INDEX "knowledge-elements_createdAt_idx" on "knowledge-elements" (cast("createdAt" AT TIME ZONE 'UTC+1' as date) DESC)`;
    await client.query(query);
  });
}

module.exports = {
  add
}