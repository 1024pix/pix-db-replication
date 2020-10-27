const { expect } = require('chai');
const steps = require('../../steps');
const { createBackupAndCreateEmptyDatabase } = require('./test-helper');
const Database = require('../utils/database');

describe('Integration | steps.js', () => {

  const databaseConfig = {
    serverUrl: process.env.TEST_POSTGRES_URL || 'postgres://postgres@localhost',
    databaseName: 'pix_replication_test',
    tableName: 'test_table',
    tableRowCount: 100000,
  };

  process.env.DATABASE_URL = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;

  context('whatever options are provided', ()=> {
    let database;
    let backupFile;

    before(async function() {
      // given
      database = await Database.create(databaseConfig);
      backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, {});

      // when
      await steps.restoreBackup({ backupFile });
    });

    after(function() {
      database.dropDatabase();
    });

    it('restores the data', async function() {
      // then
      const restoredRowCount = parseInt(await database.runSql(`SELECT COUNT(*) FROM ${databaseConfig.tableName}`));
      expect(restoredRowCount).to.equal(databaseConfig.tableRowCount);
    });

    it('does not restore comments', async function() {
      // then
      const restoredComment = await database.runSql(`SELECT obj_description('${databaseConfig.tableName}'::regclass, 'pg_class')`);
      expect(restoredComment).to.be.empty;
    });

  });

  context('according to environment variables', ()=>{

    context('table restoration', ()=> {

      context('if disabled', () => {

        it('should not restore these tables', async function() {

          process.env.RESTORE_ANSWERS_AND_KES = undefined;
          // given
          const database = await Database.create(databaseConfig);
          const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported: true });

          // when
          await steps.restoreBackup({ backupFile });

          // then
          const isAnswersRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
          expect(isAnswersRestored).to.equal(0);

          // then
          const isKnowledgeElementsRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
          expect(isKnowledgeElementsRestored).to.equal(0);

          await database.dropDatabase();
        });

      });

      context('if enabled', () => {

        let database;
        let backupFile;

        before(async function() {
          process.env.RESTORE_ANSWERS_AND_KES = true;
          // given
          database = await Database.create(databaseConfig);
          backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported: true });

          // when
          await steps.restoreBackup({ backupFile });
        });

        after(async function() {
          await database.dropDatabase();
        });

        it('does restore these tables', async function() {
          // then
          const isAnswersRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
          expect(isAnswersRestored).to.equal(1);

          // then
          const isKnowledgeElementsRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
          expect(isKnowledgeElementsRestored).to.equal(1);
        });

      });
    });

    context('foreign key constraints', ()=> {

      context('if enabled', () => {
        let database;
        let backupFile;

        before(async function() {
        // given
          process.env.RESTORE_FK_CONSTRAINTS = 'true';
          database = await Database.create(databaseConfig);
          backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });
        });

        after(async function() {
          await database.dropDatabase();
        });

        it('should restore these constraints', async function() {
        // when
          await steps.restoreBackup({ backupFile });

          // then
          const areForeignKeysRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
          expect(areForeignKeysRestored).to.equal(1);
        });

      });

      context('if disabled', ()=> {
        let database;
        let backupFile;

        before(async function() {
        // given
          process.env.RESTORE_FK_CONSTRAINTS = 'false';
          database = await Database.create(databaseConfig);
          backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

          // when
          await steps.restoreBackup({ backupFile });
        });

        after(async function() {
          await database.dropDatabase();
        });

        it('should not restore keys constraints', async function() {
        // then
          const areForeignKeysRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
          expect(areForeignKeysRestored).to.equal(0);
        });
      });

    });

  });
});
