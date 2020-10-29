require('dotenv').config();
const { Client } = require('pg');
const _ = require('lodash');
const steps = require('../steps');

async function withDb(cb) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await client.connect();
    return await cb(client);
  } finally {
    await client.end();
  }
}

async function importAndDump() {
  await steps.importAirtableData();
  const tables = ['domains', 'competences', 'tubes', 'skills', 'challenges', 'tests'];
  const results = await withDb((db) => Promise.all(tables.map(async (t) => {
    return [ t, (await db.query(`SELECT * FROM ${t}`)).rows ];
  })));
  const result = _.fromPairs(results);
  // eslint-disable-next-line no-console
  console.dir(result, { depth: 3 });
}

importAndDump();
