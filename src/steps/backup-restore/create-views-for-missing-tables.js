'use strict';

import { runDBOperation } from '../../database-helper.js';
import { logger } from '../../logger.js';

async function createViewForMissingTables(configuration) {
  await runDBOperation(async (client) => {
    const results = await client.query('SELECT * FROM "pg_tables" WHERE "tablename" = \'schooling-registrations\'');

    if (results.rowCount === 0) {
      logger.info('CREATE VIEW "schooling-registrations" IF TABLE NOT EXISTS - Started');
      await client.query('CREATE VIEW "schooling-registrations" AS SELECT * FROM "organization-learners"');
      logger.info('CREATE VIEW "schooling-registrations" IF TABLE NOT EXISTS - Ended');
    }
  }, configuration);
}

export { createViewForMissingTables };
