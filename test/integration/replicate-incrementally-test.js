const { expect } = require('chai');
const pgUrlParser = require('pg-connection-string').parse;
const Database = require('../utils/database');
const { createAndFillDatabase, createBackup } = require('./test-helper');
const steps = require('../../steps');

const { run } = require('../../src/replicate-incrementally');

describe('Integration | replicate-incrementally.js', () => {

  describe('run', function() {

    const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://pix@localhost:5431/replication_source';
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

    context('when incremental restore is disabled', () => {

      it('should not copy any values', async function() {

        // given
        targetDatabase = await Database.create(targetDatabaseConfig);
        await createAndFillDatabase(targetDatabase, targetDatabaseConfig, { createTablesNotToBeImported: true });
        const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountBefore).not.to.equal(0);

        // when
        process.env.SOURCE_DATABASE_URL = SOURCE_DATABASE_URL;
        process.env.TARGET_DATABASE_URL = TARGET_DATABASE_URL;
        delete process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY;
        await run();

        // then
        const knowledgeElementsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountAfter).to.equal(knowledgeElementsCountAfter);

      });

    });

    context('when incremental restore is enabled', () => {

      it('should throw if target tables are empty', async function() {

        // given

        sourceDatabase = await Database.create(sourceDatabaseConfig);
        const backupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

        targetDatabase = await Database.create(targetDatabaseConfig);
        process.env.RESTORE_ANSWERS_AND_KES = 'true';
        process.env.RESTORE_FK_CONSTRAINTS = 'false';
        delete process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY;
        await steps.restoreBackup({ backupFile, databaseUrl: targetDatabaseConfig.databaseUrl });

        // Day 2

        // given
        sourceDatabase = await Database.create(sourceDatabaseConfig);
        await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

        targetDatabase = await Database.create(targetDatabaseConfig);
        await createAndFillDatabase(targetDatabase, targetDatabaseConfig, { createTablesNotToBeImported: true });
        await targetDatabase.runSql('DELETE FROM answers');

        delete process.env.RESTORE_ANSWERS_AND_KES;
        delete process.env.RESTORE_FK_CONSTRAINTS;
        process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = 'true';

        // when - then
        process.env.SOURCE_DATABASE_URL = SOURCE_DATABASE_URL;
        process.env.TARGET_DATABASE_URL = TARGET_DATABASE_URL;

        expect(run).to.throw('Answers table must not be empty on target database');
      });

      it('should copy all missing values', async function() {

        // given

        // Day 1
        sourceDatabase = await Database.create(sourceDatabaseConfig);
        const backupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

        targetDatabase = await Database.create(targetDatabaseConfig);
        process.env.RESTORE_ANSWERS_AND_KES = 'true';
        process.env.RESTORE_FK_CONSTRAINTS = 'false';
        delete process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY;
        await steps.restoreBackup({ backupFile, databaseUrl: targetDatabaseConfig.databaseUrl });

        const answersCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM answers'));
        expect(answersCountBefore).not.to.equal(0);

        const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountBefore).not.to.equal(0);

        // Day 2

        // given
        sourceDatabase = await Database.create(sourceDatabaseConfig);
        await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
        await sourceDatabase.runSql('INSERT INTO answers (id, "challengeId") VALUES (2,2)');
        await sourceDatabase.runSql('INSERT INTO answers (id, "challengeId") VALUES (3,2)');
        await sourceDatabase.runSql('INSERT INTO "knowledge-elements"  (id, "userId", "createdAt") VALUES (2, 2, CURRENT_TIMESTAMP)');
        await sourceDatabase.runSql('INSERT INTO "knowledge-elements"  (id, "userId", "createdAt") VALUES (3, 2, CURRENT_TIMESTAMP)');

        delete process.env.RESTORE_ANSWERS_AND_KES;
        delete process.env.RESTORE_FK_CONSTRAINTS;
        process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY = 'true';

        // when
        process.env.SOURCE_DATABASE_URL = SOURCE_DATABASE_URL;
        process.env.TARGET_DATABASE_URL = TARGET_DATABASE_URL;
        await run();

        // then
        const answersCountAfter = parseInt(await targetDatabase.runSql('SELECT  COUNT(1) FROM answers'));
        expect(answersCountAfter).to.equal(answersCountBefore + 2);

        // then
        const knowledgeElementsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountAfter).to.equal(knowledgeElementsCountBefore + 2);
        // TODO: check the rows copied have matching IDs

      });

    });

  });
});
