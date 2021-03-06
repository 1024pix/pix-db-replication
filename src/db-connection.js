const { Client } = require('pg');

async function runDBOperation(callback, configuration) {
  const client = new Client({
    connectionString: configuration.DATABASE_URL,
  });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

module.exports = {
  runDBOperation,
};
