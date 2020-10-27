const { expect } = require('chai');
const steps = require('../../steps');
const { createBackupAndCreateEmptyDatabase, createBackup } = require('./test-helper');
const Database = require('../utils/database');

describe('Integration | steps.js', () => {

  describe('#restoreBackup', () => {

    const databaseConfig = {
      serverUrl: process.env.TEST_POSTGRES_URL || 'postgres://postgres@localhost',
      databaseName: 'pix_replication_test',
      tableName: 'test_table',
      tableRowCount: 100000,
    };

    databaseConfig.databaseUrl = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;

    context('whatever options are provided', ()=> {
      let database;
      let backupFile;

      before(async function() {
      // given
        database = await Database.create(databaseConfig);
        backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, {});

        // when
        await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

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
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

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
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });
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
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

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
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });
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

  describe('#downloadAndRestoreLatestBackup', () => {

    it('if table restore is disabled and increment restore is enabled, should preserve data', async function() {

      const aMinute = 1 * 1000 * 60;
      this.timeout(aMinute);

      const sourceDatabaseConfig = {
        serverUrl: 'postgres://postgres@localhost:5431',
        databaseName: 'replication_source',
        databaseUrl: 'postgres://postgres@localhost:5431/replication_source',
        tableName: 'test_table',
        tableRowCount: 100000,
      };
      let sourceDatabase = await Database.create(sourceDatabaseConfig);

      const targetDatabaseConfig = {
        serverUrl: 'postgres://postgres@localhost:5432',
        databaseName: 'replication_target',
        databaseUrl: 'postgres://postgres@localhost:5432/replication_target',
        tableName: 'test_table',
        tableRowCount: 100000,
      };
      const targetDatabase = await Database.create(targetDatabaseConfig);

      // given
      process.env.RESTORE_ANSWERS_AND_KES = true;
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = undefined;
      const firstDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
      console.log('firstDayBackupFile: ' + firstDayBackupFile);
      await steps.restoreBackup({ backupFile: firstDayBackupFile, databaseUrl: targetDatabaseConfig.databaseUrl });

      const answersCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM answers'));
      expect(answersCountBefore).not.to.equal(0);

      const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
      expect(knowledgeElementsCountBefore).not.to.equal(0);

      await sourceDatabase.dropDatabase();
      sourceDatabase = await Database.create(sourceDatabaseConfig);

      process.env.DATABASE_URL = targetDatabaseConfig.databaseUrl;
      process.env.RESTORE_ANSWERS_AND_KES = false;
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = true;
      const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
      console.log('secondDayBackupFile: ' + secondDayBackupFile);

      // when
      await steps.downloadAndRestoreLatestBackup(secondDayBackupFile);

      // then
      const answersCountAfter = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM answers'));
      expect(answersCountBefore).to.equal(answersCountAfter);

      // then
      const knowledgeElementsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
      expect(knowledgeElementsCountBefore).to.equal(knowledgeElementsCountAfter);

      await sourceDatabase.dropDatabase();
      await targetDatabase.dropDatabase();
    });
  });

});
