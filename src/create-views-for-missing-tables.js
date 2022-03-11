'use strict';

const { runDBOperation } = require('./database-helper');
const logger = require('./logger');

async function createViewForMissingTable(configuration) {
  await runDBOperation(async (client) => {
    const results = await client.query('SELECT FROM "pg_tables" WHERE "tablename" = \'schooling-registrations\'');

    if (results.rowCount === 0) {
      logger.info('CREATE VIEW "schooling-registrations" IF TABLE NOT EXISTS - Started');
      await client.query('CREATE VIEW "schooling-registrations" AS SELECT * FROM "organization-learners"');
      logger.info('CREATE VIEW "schooling-registrations" IF TABLE NOT EXISTS - Ended');
    }
  }, configuration);
}

module.exports = createViewForMissingTable;
