const { expect } = require('chai');

const TEST_POSTGRES_URL = process.env.TEST_POSTGRES_URL || 'postgres://postgres@localhost';
const TEST_DB_NAME = 'pix_replication_test';
process.env.DATABASE_URL  = `${TEST_POSTGRES_URL}/${TEST_DB_NAME}`;

const { createAndFillDatabase } = require('./test-helper');
const Database = require('../utils/database');
const { add } = require('../../enrichment');

describe('Integration | enrichment.js', () => {

  const databaseConfig = {
    serverUrl: 'postgres://pix_test@localhost:5432',
    databaseName: 'pix_replication_test',
    tableName: 'test_table',
    tableRowCount: 100000,
  };

  databaseConfig.databaseUrl = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;

  describe('add', function() {

    context('whatever options are provided', ()=> {
      let database;

      before(async function() {
        process.env.DATABASE_URL = databaseConfig.databaseUrl;
        database = await Database.create(databaseConfig);
      });

      it('create index users_createdAt_idx', async function() {
        // given
        await createAndFillDatabase(database, databaseConfig, {});

        // when
        await add();

        // then
        const indexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'users_createdAt_idx\''));
        expect(indexCount).to.equal(1);
      });

      it('create view students', async function() {
        // then
        const viewCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_views vws WHERE vws.viewname = \'students\';'));
        expect(viewCount).to.equal(1);
      });

    });

    context('according to environment variables', ()=>{
      let database;

      before(async function() {
        process.env.DATABASE_URL = databaseConfig.databaseUrl;
        database = await Database.create(databaseConfig);
      });

      it('does create these indexes', async function() {
        // given
        process.env.RESTORE_ANSWERS_AND_KES = 'true';
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported : true });

        // when
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
