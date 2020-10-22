const { expect } = require('chai');
const { createBackupAndCreateEmptyDatabase, createBackup } = require('./test-helper');
const Database = require('../utils/database');
const pgUrlParser = require('pg-connection-string').parse;
const nock = require('nock');

const steps = require('../../steps');

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
        const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4 };

        // when
        steps.restoreBackup({ backupFile, databaseUrl: databaseConfig.databaseUrl, configuration });

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

            // given
            database = await Database.create(databaseConfig);
            const backupFile = await createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
            const configuration = { RESTORE_ANSWERS_AND_KES: undefined, RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4  };

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
            const configuration = { RESTORE_ANSWERS_AND_KES: 'true', RESTORE_FK_CONSTRAINTS: 'false',  PG_RESTORE_JOBS: 4   };

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
            const configuration = {  RESTORE_FK_CONSTRAINTS: 'true',  PG_RESTORE_JOBS: 4 };

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
            const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4  };
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
            const configuration = { RESTORE_FK_CONSTRAINTS: 'false', PG_RESTORE_JOBS: 4  };
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

    it('if backup restore is disabled and increment restore is enabled on specific tables, should preserve data', async function() {
      // given

      // Day 1
      const firstDayConfiguration = { RESTORE_ANSWERS_AND_KES : 'true', PG_RESTORE_JOBS: 4 };
      await createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseConfig.databaseUrl, firstDayConfiguration);

      const answersCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM answers'));
      expect(answersCountBefore).not.to.equal(0);

      const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
      expect(knowledgeElementsCountBefore).not.to.equal(0);

      await sourceDatabase.dropDatabase();

      // Day 2
      await sourceDatabase.createDatabase();
      const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

      // when
      const secondDayConfiguration = { RESTORE_ANSWERS_AND_KES_INCREMENTALLY : 'true', DATABASE_URL : targetDatabase._databaseUrl, PG_RESTORE_JOBS: 4   };
      await steps.dropObjectAndRestoreBackup(secondDayBackupFile, secondDayConfiguration);

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

      const firstDayTargetConfiguration = {
        PG_RESTORE_JOBS: 4,
        DATABASE_URL : targetDatabase._databaseUrl,
        RESTORE_FK_CONSTRAINTS: 'true',
        RESTORE_ANSWERS_AND_KES: 'true',
        RESTORE_ANSWERS_AND_KES_INCREMENTALLY: 'false'
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
        DATABASE_URL : targetDatabase._databaseUrl,
        RESTORE_FK_CONSTRAINTS: 'false',
        RESTORE_ANSWERS_AND_KES: 'false',
        RESTORE_ANSWERS_AND_KES_INCREMENTALLY: 'true'
      };

      // when
      await steps.dropObjectAndRestoreBackup(secondDaySourceBackupFile, secondDayTargetConfiguration);

      // then
      const countAfter = parseInt(await targetDatabase.runSql(`SELECT COUNT(1) FROM ${sourceDatabaseConfig.tableName}`));
      expect(countAfter).to.equal(sourceDatabaseConfig.tableRowCount + 1);

      const referencingCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM referencing'));
      expect(referencingCountAfter).to.equal(referencingCountBefore + 1);

    });

    it('should not fail when database contains plpgsql source', async function() {
      // given

      // Day 1
      const firstDayTargetConfiguration = { RESTORE_ANSWERS_AND_KES : 'true', PG_RESTORE_JOBS: 4 };
      await createBackUpFromSourceAndRestoreToTarget(sourceDatabase, sourceDatabaseConfig, targetDatabaseConfig.databaseUrl, firstDayTargetConfiguration);
      await sourceDatabase.dropDatabase();

      // Day 2
      sourceDatabase = await Database.create(sourceDatabaseConfig);
      const secondDayBackupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true, createFunction: true });
      const secondDayTargetConfiguration = { RESTORE_ANSWERS_AND_KES_INCREMENTALLY : 'true', DATABASE_URL : targetDatabase._databaseUrl, PG_RESTORE_JOBS: 4 };

      const dropObjectAndRestoreBackupWithArguments = function() {
        steps.dropObjectAndRestoreBackup(secondDayBackupFile, secondDayTargetConfiguration);
      };

      // when
      // then
      expect(dropObjectAndRestoreBackupWithArguments).not.to.throw;
    });
  });

  describe('#importAirtableData', () => {

    let database;
    let targetDatabaseConfig;
    const AIRTABLE_API_KEY = 'keyblo10ZCvCqBAJg';
    const AIRTABLE_BASE =  'app3fvsqhtHJntXaC';

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

      database = await Database.create(targetDatabaseConfig);
    });

    it('should import data', async function() {

      // when
      const configuration = { AIRTABLE_API_KEY, AIRTABLE_BASE, DATABASE_URL: targetDatabaseConfig.databaseUrl };
      await steps.importAirtableData(configuration);

      // then
      const competenceRowCount = parseInt(await database.runSql('SELECT COUNT(*) FROM competences'));
      expect(competenceRowCount).to.be.above(0);

    });

  });

  describe('#importAirtableData', () => {

    let targetDatabaseConfig;
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

      await Database.create(targetDatabaseConfig);
    });

    context('according to AirTable API status', () => {

      it('when API is unavailable, should retry at most the expected time', async function() {

        // given
        process.env.DATABASE_URL = targetDatabaseConfig.databaseUrl;
        process.env.AIRTABLE_KEY = 'key8BhNMj8YDSHTpa';
        process.env.AIRTABLE_BASE = 'appHAIFk9u1qqglhX';

        const baseUrl = 'https://api.airtable.com';
        const path = '/v0/appHAIFk9u1qqglhX/Domaines?fields%5B%5D=Nom&fields%5B%5D=id+persistant';
        const UNAVAILABLE_STATUS_CODE = 503;

        const RETRIES_TIMEOUT_MINUTES = 1;

        const domainesAirtableCall = nock(baseUrl,  { allowUnmocked: true })
          .get(path)
          .reply(UNAVAILABLE_STATUS_CODE, {});

        // when
        const startedAt = new Date();
        await steps.importAirtableData({ max_retry_count: 1000 , retries_timeout_minutes: RETRIES_TIMEOUT_MINUTES });
        const endedAt = new Date();
        const elapsedTime = Math.round((endedAt - startedAt) / 1000 / 60);

        // then
        expect(domainesAirtableCall.isDone()).to.be.true;
        expect(elapsedTime).to.be.at.least(RETRIES_TIMEOUT_MINUTES - 1);
        expect(elapsedTime).to.be.at.most(RETRIES_TIMEOUT_MINUTES);

      });

    });

  });

});

