/* eslint no-process-env: "off" */

const { expect } = require('chai');
const steps = require('../../steps');
const { createBackupAndCreateEmptyDatabase, createBackup } = require('./test-helper');
const Database = require('../utils/database');
const pgUrlParser = require('pg-connection-string').parse;

describe('Integration | steps.js', () => {

  describe('#restoreBackup', () => {

    // CircleCI set up environment variables to access DB, so we need to read them here
    // eslint-disable-next-line no-process-env
    const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://postgres@localhost:5432/replication_target';
    const config = pgUrlParser(DATABASE_URL);

    const databaseConfig = {
      serverUrl: `postgres://${config.user}@${config.host}:${config.port}`,
      databaseName: config.database,
      tableName: 'test_table',
      tableRowCount: 100000,
    };

    databaseConfig.databaseUrl = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;

    context('whatever options are provided', () => {

      let database;

      afterEach(() => {
        database.dropDatabase();
      });

      it('does not restore comments', async function() {
        // given
        database = await Database.create(databaseConfig);
        const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, {});

        // when
        await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

        // then
        const restoredRowCount = parseInt(await database.runSql(`SELECT COUNT(*) FROM ${databaseConfig.tableName}`));
        expect(restoredRowCount).to.equal(databaseConfig.tableRowCount);

        // then
        const restoredComment = await database.runSql(`SELECT obj_description('${databaseConfig.tableName}'::regclass, 'pg_class')`);
        expect(restoredComment).to.be.empty;
      });

    });

    context('according to environment variables', () => {

      context('table restoration', () => {

        context('if disabled', () => {

          let database;

          afterEach(() => {
            database.dropDatabase();
          });

          it('should not restore these tables', async function() {

            process.env.RESTORE_ANSWERS_AND_KES = undefined;
            // given
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

            // then
            const isAnswersRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
            expect(isAnswersRestored).to.equal(0);

            // then
            const isKnowledgeElementsRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
            expect(isKnowledgeElementsRestored).to.equal(0);

          });

        });

        context('if enabled', () => {

          let database;

          afterEach(async function() {
            await database.dropDatabase();
          });

          it('does restore these tables', async function() {

            // given
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported: true });

            // when
            process.env.RESTORE_ANSWERS_AND_KES = true;
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

            // then
            const isAnswersRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
            expect(isAnswersRestored).to.equal(1);

            // then
            const isKnowledgeElementsRestored = parseInt(await database.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
            expect(isKnowledgeElementsRestored).to.equal(1);
          });

        });
      });

      context('foreign key constraints', () => {

        context('if enabled', () => {
          let database;

          afterEach(async function() {
            await database.dropDatabase();
          });

          it('should restore these constraints', async function() {

            // given
            process.env.RESTORE_FK_CONSTRAINTS = 'true';
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

            // then
            const areForeignKeysRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
            expect(areForeignKeysRestored).to.equal(1);
          });

        });

        context('if disabled', () => {
          let database;

          afterEach(async function() {
            await database.dropDatabase();
          });

          it('should not restore keys constraints', async function() {

            // given
            process.env.RESTORE_FK_CONSTRAINTS = 'false';
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

            // then
            const areForeignKeysRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
            expect(areForeignKeysRestored).to.equal(0);
          });

          it('should restore referencing table with data', async function() {

            // given
            process.env.RESTORE_FK_CONSTRAINTS = 'false';
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

            // then
            const isAnswersRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM referencing'));
            expect(isAnswersRestored).to.equal(2);
          });

          it('should restore referenced table with data', async function() {

            // given
            process.env.RESTORE_FK_CONSTRAINTS = 'false';
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl });

            // then
            const isAnswersRestored = parseInt(await database.runSql(`SELECT COUNT(1) FROM ${databaseConfig.tableName} `));
            expect(isAnswersRestored).to.equal(databaseConfig.tableRowCount);
          });

        });

      });

    });
  });

  describe('#dropObjectAndRestoreBackup', () => {
    let sourceDatabase;
    let targetDatabase;
    let sourceDatabaseConfig;
    let targetDatabaseConfig;

    before(async() => {
      const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://pix@localhost:5432/replication_source';
      const rawSourceDataBaseConfig = pgUrlParser(SOURCE_DATABASE_URL);

      sourceDatabaseConfig = {
        serverUrl: `postgres://${rawSourceDataBaseConfig.user}@${rawSourceDataBaseConfig.host}:${rawSourceDataBaseConfig.port}`,
        databaseName: rawSourceDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      sourceDatabaseConfig.databaseUrl = `${sourceDatabaseConfig.serverUrl}/${sourceDatabaseConfig.databaseName}`;

      const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';
      const rawTargetDataBaseConfig = pgUrlParser(TARGET_DATABASE_URL);

      targetDatabaseConfig = {
        serverUrl: `postgres://${rawSourceDataBaseConfig.user}@${rawTargetDataBaseConfig.host}:${rawTargetDataBaseConfig.port}`,
        databaseName: rawTargetDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      targetDatabaseConfig.databaseUrl = `${targetDatabaseConfig.serverUrl}/${targetDatabaseConfig.databaseName}`;

    });

    beforeEach(async () => {
      sourceDatabase = await Database.create(sourceDatabaseConfig);
      targetDatabase = await Database.create(targetDatabaseConfig);
    });

    async function createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseUrl) {
      const backupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
      await steps.restoreBackup({ backupFile, databaseUrl: targetDatabaseUrl });
    }

    it('if backup restore is disabled and increment restore is enabled on specific tables, should preserve data', async function() {
      // given

      // Day 1
      process.env.RESTORE_ANSWERS_AND_KES = true;
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = undefined;

      await createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseConfig.databaseUrl);

      const answersCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM answers'));
      expect(answersCountBefore).not.to.equal(0);

      const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
      expect(knowledgeElementsCountBefore).not.to.equal(0);

      await sourceDatabase.dropDatabase();

      // Day 2
      process.env.DATABASE_URL = targetDatabaseConfig.databaseUrl;
      process.env.RESTORE_ANSWERS_AND_KES = false;
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = true;
      await sourceDatabase.createDatabase();
      const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

      // when
      const configuration = { RESTORE_ANSWERS_AND_KES_INCREMENTALLY : 'true', DATABASE_URL : targetDatabase._databaseUrl };
      await steps.dropObjectAndRestoreBackup(secondDayBackupFile, configuration);

      // then
      const answersCountAfter = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM answers'));
      expect(answersCountBefore).to.equal(answersCountAfter);

      // then
      const knowledgeElementsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
      expect(knowledgeElementsCountBefore).to.equal(knowledgeElementsCountAfter);
    });

    it('if backup restore is disabled and increment restore is enabled on specific tables, should restore data on other tables', async function() {
      // Day 1

      // Source: create backup
      const sourceDatabase = await Database.create(sourceDatabaseConfig);
      const firstDaySourceBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true, createForeignKeys: true, dropDatabase : false });

      // Target : restore backup
      const targetDatabase = await Database.create(targetDatabaseConfig);
      process.env.RESTORE_FK_CONSTRAINTS = 'true';
      process.env.RESTORE_ANSWERS_AND_KES = 'true';
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = 'false';

      process.env.DATABASE_URL = targetDatabase._databaseUrl;
      await steps.dropObjectAndRestoreBackup(firstDaySourceBackupFile);

      const referencingCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM referencing'));
      expect(referencingCountBefore).not.to.equal(0);

      // Day 2

      // Source : add data and create backup
      await sourceDatabase.runSql(`INSERT INTO ${sourceDatabaseConfig.tableName}(id) VALUES(${sourceDatabaseConfig.tableRowCount + 1})`);
      await sourceDatabase.runSql('INSERT INTO referencing (id) VALUES (3)');
      const secondDaySourceBackupFile = await sourceDatabase.createBackup();

      // Target : restore backup
      process.env.RESTORE_FK_CONSTRAINTS = 'false';
      process.env.RESTORE_ANSWERS_AND_KES = 'false';
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = 'true';
      // when
      process.env.DATABASE_URL = targetDatabase._databaseUrl;
      await steps.dropObjectAndRestoreBackup(secondDaySourceBackupFile);

      // then
      const countAfter = parseInt(await targetDatabase.runSql(`SELECT COUNT(1) FROM ${sourceDatabaseConfig.tableName}`));
      expect(countAfter).to.equal(sourceDatabaseConfig.tableRowCount + 1);

      const referencingCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM referencing'));
      expect(referencingCountAfter).to.equal(referencingCountBefore + 1);

    });

    it('should not fail when database contains plpgsql source', async function() {
      // given

      // Day 1
      process.env.RESTORE_ANSWERS_AND_KES = true;
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = undefined;
      await createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseConfig.databaseUrl);
      await sourceDatabase.dropDatabase();

      // Day 2
      process.env.RESTORE_ANSWERS_AND_KES = false;
      process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = true;
      sourceDatabase = await Database.create(sourceDatabaseConfig);
      const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true, createFunction: true });

      // when
      const configuration = { RESTORE_ANSWERS_AND_KES_INCREMENTALLY : 'true', DATABASE_URL : targetDatabase._databaseUrl };
      steps.dropObjectAndRestoreBackup(secondDayBackupFile, configuration);
    });
  });

});
