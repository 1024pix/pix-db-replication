const { expect } = require('chai');
const { createBackupAndCreateEmptyDatabase, createAndFillDatabase, createBackup } = require('./test-helper');
const Database = require('../utils/database');
const pgUrlParser = require('pg-connection-string').parse;
const fs = require('fs');

const steps = require('../../src/steps');

describe('Integration | steps.js', () => {

  describe('#backupAndRestore', () => {
    // CircleCI set up environment variables to access DB, so we need to read them here
    // eslint-disable-next-line no-process-env
    const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://pix@localhost:5432/replication_source';
    // eslint-disable-next-line no-process-env
    const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';
    let sourceDatabase;
    let targetDatabase;
    let sourceDatabaseConfig;
    let targetDatabaseConfig;

    before(async() => {
      const rawSourceDataBaseConfig = pgUrlParser(SOURCE_DATABASE_URL);

      sourceDatabaseConfig = {
        serverUrl: `postgres://${rawSourceDataBaseConfig.user}@${rawSourceDataBaseConfig.host}:${rawSourceDataBaseConfig.port}`,
        databaseName: rawSourceDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      sourceDatabaseConfig.databaseUrl = `${sourceDatabaseConfig.serverUrl}/${sourceDatabaseConfig.databaseName}`;

      const rawTargetDataBaseConfig = pgUrlParser(TARGET_DATABASE_URL);

      targetDatabaseConfig = {
        serverUrl: `postgres://${rawSourceDataBaseConfig.user}@${rawTargetDataBaseConfig.host}:${rawTargetDataBaseConfig.port}`,
        databaseName: rawTargetDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      targetDatabaseConfig.databaseUrl = `${targetDatabaseConfig.serverUrl}/${targetDatabaseConfig.databaseName}`;

    });

    afterEach(async function() {
      await sourceDatabase.dropDatabase();
      await targetDatabase.dropDatabase();
    });

    it('backup and restore the database without answers, knowledge-elements & knowledge-element-snapshots', async () => {
      // given
      const configuration = {
        SOURCE_DATABASE_URL,
        TARGET_DATABASE_URL,
        DATABASE_URL: TARGET_DATABASE_URL,
        RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'false',
        PG_RESTORE_JOBS: 1,
      };
      sourceDatabase = await Database.create(sourceDatabaseConfig);
      await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
      targetDatabase = await Database.create(targetDatabaseConfig);

      // when
      await steps.backupAndRestore(configuration);

      // then
      const restoredRowCount = parseInt(await targetDatabase.runSql(`SELECT COUNT(*) FROM ${targetDatabaseConfig.tableName}`));
      expect(restoredRowCount).to.equal(targetDatabaseConfig.tableRowCount);

      const isAnswersRestored = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
      expect(isAnswersRestored).to.equal(0);

      // then
      const isKnowledgeElementsRestored = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
      expect(isKnowledgeElementsRestored).to.equal(0);
    });

    it('backup and restore the database with answers and knowledge-elements ', async () => {
      // given
      const configuration = {
        SOURCE_DATABASE_URL,
        TARGET_DATABASE_URL,
        DATABASE_URL: TARGET_DATABASE_URL,
        RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true',
        PG_RESTORE_JOBS: 1,
      };
      sourceDatabase = await Database.create(sourceDatabaseConfig);
      await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
      targetDatabase = await Database.create(targetDatabaseConfig);

      // when
      await steps.backupAndRestore(configuration);

      // then
      const restoredRowCount = parseInt(await targetDatabase.runSql(`SELECT COUNT(*) FROM ${targetDatabaseConfig.tableName}`));
      expect(restoredRowCount).to.equal(targetDatabaseConfig.tableRowCount);

      const isAnswersRestored = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
      expect(isAnswersRestored).to.equal(1);

      // then
      const isKnowledgeElementsRestored = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
      expect(isKnowledgeElementsRestored).to.equal(1);
    });
  });

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
        const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };

        // when
        await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

        // then
        const countOfTable = await database.runSql(`SELECT COUNT(*) FROM ${databaseConfig.tableName}`);
        const restoredRowCount = parseInt(countOfTable);
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

            // given
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
            const configuration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: undefined, RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

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
            const configuration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true', RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

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
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });
            const configuration = { RESTORE_FK_CONSTRAINTS: 'true', PG_RESTORE_JOBS: 4 };

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

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
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });
            const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

            // then
            const areForeignKeysRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
            expect(areForeignKeysRestored).to.equal(0);
          });

          it('should restore referencing table with data', async function() {

            // given
            const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

            // then
            const isAnswersRestored = parseInt(await database.runSql('SELECT COUNT(1) FROM referencing'));
            expect(isAnswersRestored).to.equal(2);
          });

          it('should restore referenced table with data', async function() {

            // given
            const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createForeignKeys: true });

            // when
            await steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

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

      // CircleCI set up environment variables to access DB, so we need to read them here
      // eslint-disable-next-line no-process-env
      const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://pix@localhost:5432/replication_source';
      const rawSourceDataBaseConfig = pgUrlParser(SOURCE_DATABASE_URL);

      sourceDatabaseConfig = {
        serverUrl: `postgres://${rawSourceDataBaseConfig.user}@${rawSourceDataBaseConfig.host}:${rawSourceDataBaseConfig.port}`,
        databaseName: rawSourceDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      sourceDatabaseConfig.databaseUrl = `${sourceDatabaseConfig.serverUrl}/${sourceDatabaseConfig.databaseName}`;

      // CircleCI set up environment variables to access DB, so we need to read them here
      // eslint-disable-next-line no-process-env
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

    async function createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseUrl, configuration) {
      const backupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
      await steps.restoreBackup({ backupFile, databaseUrl: targetDatabaseUrl, configuration });
    }

    context('On specific tables, when restore is done incrementally (and not by backup)', () => {

      it('should preserve data', async function() {
        // given

        // Day 1
        const firstDayConfiguration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true', PG_RESTORE_JOBS: 4 };
        await createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseConfig.databaseUrl, firstDayConfiguration);

        const answersCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM answers'));
        expect(answersCountBefore).not.to.equal(0);

        const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountBefore).not.to.equal(0);

        const knowledgeElementSnapshotsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-element-snapshots"'));
        expect(knowledgeElementSnapshotsCountBefore).not.to.equal(0);

        await sourceDatabase.dropDatabase();

        // Day 2
        await sourceDatabase.createDatabase();
        const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

        // when
        const secondDayConfiguration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: 'true', DATABASE_URL: targetDatabase._databaseUrl, PG_RESTORE_JOBS: 4 };
        await steps.dropObjectAndRestoreBackup(secondDayBackupFile, secondDayConfiguration);

        // then
        const answersCountAfter = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM answers'));
        expect(answersCountBefore).to.equal(answersCountAfter);

        // then
        const knowledgeElementsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountBefore).to.equal(knowledgeElementsCountAfter);

        // then
        const knowledgeElementSnapshotsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-element-snapshots"'));
        expect(knowledgeElementSnapshotsCountBefore).to.equal(knowledgeElementSnapshotsCountAfter);
      });

      it('should restore data on other tables', async function() {
        // Day 1

        // Source: create backup
        const sourceDatabase = await Database.create(sourceDatabaseConfig);
        const firstDaySourceBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true, createForeignKeys: true, dropDatabase: false });

        // Target : restore backup
        const targetDatabase = await Database.create(targetDatabaseConfig);

        const firstDayTargetConfiguration = {
          PG_RESTORE_JOBS: 4,
          DATABASE_URL: targetDatabase._databaseUrl,
          RESTORE_FK_CONSTRAINTS: 'true',
          RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true',
          RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: 'false',
        };

        await steps.dropObjectAndRestoreBackup(firstDaySourceBackupFile, firstDayTargetConfiguration);

        const referencingCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM referencing'));
        expect(referencingCountBefore).not.to.equal(0);

        // Day 2

        // Source : add data and create backup
        await sourceDatabase.runSql(`INSERT INTO ${sourceDatabaseConfig.tableName}(id) VALUES(${sourceDatabaseConfig.tableRowCount + 1})`);
        await sourceDatabase.runSql('INSERT INTO referencing (id) VALUES (3)');
        const secondDaySourceBackupFile = await sourceDatabase.createBackup();

        // Target : restore backup
        const secondDayTargetConfiguration = {
          PG_RESTORE_JOBS: 4,
          DATABASE_URL: targetDatabase._databaseUrl,
          RESTORE_FK_CONSTRAINTS: 'false',
          RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'false',
          RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: 'true',
        };

        // when
        await steps.dropObjectAndRestoreBackup(secondDaySourceBackupFile, secondDayTargetConfiguration);

        // then
        const countAfter = parseInt(await targetDatabase.runSql(`SELECT COUNT(1) FROM ${sourceDatabaseConfig.tableName}`));
        expect(countAfter).to.equal(sourceDatabaseConfig.tableRowCount + 1);

        const referencingCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM referencing'));
        expect(referencingCountAfter).to.equal(referencingCountBefore + 1);

      });
    });

    it('should not fail when database contains plpgsql source', async function() {
      // given

      // Day 1
      const firstDayTargetConfiguration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true', PG_RESTORE_JOBS: 4 };
      await createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseConfig.databaseUrl, firstDayTargetConfiguration);
      await sourceDatabase.dropDatabase();

      // Day 2
      sourceDatabase = await Database.create(sourceDatabaseConfig);
      const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true, createFunction: true });
      const secondDayTargetConfiguration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: 'true', DATABASE_URL: targetDatabase._databaseUrl, PG_RESTORE_JOBS: 4 };

      const dropObjectAndRestoreBackupWithArguments = function() {
        steps.dropObjectAndRestoreBackup(secondDayBackupFile, secondDayTargetConfiguration);
      };

      // when
      // then
      expect(dropObjectAndRestoreBackupWithArguments).not.to.throw;
    });
  });

  describe('#importAirtableData', () => {

    let targetDatabaseConfig;
    let targetDatabase;
    before(async() => {

      // CircleCI set up environment variables to access DB, so we need to read them here
      // eslint-disable-next-line no-process-env
      const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';
      const rawTargetDataBaseConfig = pgUrlParser(TARGET_DATABASE_URL);

      targetDatabaseConfig = {
        serverUrl: `postgres://${rawTargetDataBaseConfig.user}@${rawTargetDataBaseConfig.host}:${rawTargetDataBaseConfig.port}`,
        databaseName: rawTargetDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      targetDatabaseConfig.databaseUrl = `${targetDatabaseConfig.serverUrl}/${targetDatabaseConfig.databaseName}`;

      targetDatabase = await Database.create(targetDatabaseConfig);
    });

    context('according to Airtable API status', () => {

      it('if available, should import data', async function() {

        // when
        const configuration = {
          AIRTABLE_API_KEY: 'keyblo10ZCvCqBAJg',
          AIRTABLE_BASE: 'app3fvsqhtHJntXaC',
          DATABASE_URL: targetDatabaseConfig.databaseUrl,
          MAX_RETRY_COUNT: 10,
          RETRIES_TIMEOUT_MINUTES: 180,
        };

        await steps.importAirtableData(configuration);

        // then
        const competenceRowCount = parseInt(await targetDatabase.runSql('SELECT COUNT(*) FROM competences'));
        expect(competenceRowCount).to.be.above(0);

      });

      it('if available but credentials are invalid, should not retry the expect time, but throw', async function() {

        // given
        const configuration = {
          DATABASE_URL: targetDatabaseConfig.databaseUrl,
          AIRTABLE_API_KEY: 'INVALID',
          AIRTABLE_BASE: 'INVALID',
          MAX_RETRY_COUNT: 1000,
          RETRIES_TIMEOUT_MINUTES: 1,
        };

        // when
        const startedAt = new Date();
        let errorMessage;
        try {
          await steps.importAirtableData(configuration);
        } catch (error) {
          errorMessage = error.message;
        }
        const endedAt = new Date();
        const elapsedTimeMinutes = Math.round((endedAt - startedAt) / 1000 / 60);

        // then
        expect(errorMessage).to.eq('Could not find what you are looking for');
        expect(elapsedTimeMinutes).to.eq(0);

      });

    });

  });

  describe('#createBackup', () => {

    // eslint-disable-next-line no-process-env
    const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://postgres@localhost:5432/replication_source';

    let sourceDatabase;
    let sourceDatabaseConfig;

    before(async() => {
      const rawSourceDataBaseConfig = pgUrlParser(SOURCE_DATABASE_URL);

      sourceDatabaseConfig = {
        serverUrl: `postgres://${rawSourceDataBaseConfig.user}@${rawSourceDataBaseConfig.host}:${rawSourceDataBaseConfig.port}`,
        databaseName: rawSourceDataBaseConfig.database,
        tableName: 'test_table',
        tableRowCount: 100000,
      };

      sourceDatabaseConfig.databaseUrl = `${sourceDatabaseConfig.serverUrl}/${sourceDatabaseConfig.databaseName}`;

      sourceDatabase = await Database.create(sourceDatabaseConfig);
      await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
    });

    after(async function() {
      await sourceDatabase.dropDatabase();
    });

    it('should create a file', async () => {
      // given
      const configuration = {
        RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: false,
        SOURCE_DATABASE_URL,
      };

      // when
      const dumpFile = await steps.createBackup(configuration);
      const result = fs.existsSync(dumpFile);

      // then
      expect(result).to.be.true;
    });
  });

});
