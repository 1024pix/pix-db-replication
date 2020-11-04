const { expect } = require('chai');
const pgUrlParser = require('pg-connection-string').parse;

const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';

const { createAndFillDatabase } = require('./test-helper');
const Database = require('../utils/database');
const { add } = require('../../enrichment');

describe('Integration | enrichment.js', () => {

  const config = pgUrlParser(DATABASE_URL);

  const databaseConfig = {
    serverUrl: `postgres://${config.user}@${config.host}:${config.port}`,
    databaseName: config.database,
    tableName: 'test_table',
    tableRowCount: 100000,
  };

  databaseConfig.databaseUrl = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;

  describe('add', function() {

    context('whatever options are provided', () => {
      let database;

      afterEach(() => {
        delete process.env.DATABASE_URL;
        database.dropDatabase();
      });

      it('create index users_createdAt_idx', async function() {

        // given
        database = await Database.create(databaseConfig);
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
        process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = 'true';

        // when
        process.env.DATABASE_URL = databaseConfig.databaseUrl;
        await add();

        // then
        const indexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'users_createdAt_idx\''));
        expect(indexCount).to.equal(1);
      });

      it('create view students', async function() {

        // given
        database = await Database.create(databaseConfig);
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
        process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = 'true';

        // when
        process.env.DATABASE_URL = databaseConfig.databaseUrl;
        await add();

        // then
        const viewCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_views vws WHERE vws.viewname = \'students\';'));
        expect(viewCount).to.equal(1);
      });

    });

    context('according to environment variables', () => {
      let database;

      afterEach(() => {
        delete process.env.DATABASE_URL;
        database.dropDatabase();
      });

      it('does create these indexes', async function() {
        // given
        database = await Database.create(databaseConfig);
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported : true });
        process.env.RESTORE_ANSWERS_AND_KES = 'true';

        // when
        process.env.DATABASE_URL = databaseConfig.databaseUrl;
        await add();

        // then
        const KEIndexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'knowledge-elements_createdAt_idx\''));
        expect(KEIndexCount).to.equal(1);

        // then
        const answersIndexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'answers_challengeId_idx\''));
        expect(answersIndexCount).to.equal(1);
      });

    });

  });

});
