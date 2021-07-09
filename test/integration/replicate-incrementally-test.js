const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const pgUrlParser = require('pg-connection-string').parse;
const Database = require('../utils/database');
const { createAndFillDatabase, createBackup } = require('./test-helper');

const steps = require('../../src/steps');
const { run } = require('../../src/replicate-incrementally');

describe('Integration | replicate-incrementally.js', () => {

  describe('run', function() {

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

    context('when incremental restore is disabled', () => {

      it('should not copy any values', async function() {

        // given
        targetDatabase = await Database.create(targetDatabaseConfig);
        await createAndFillDatabase(targetDatabase, targetDatabaseConfig, { createTablesNotToBeImported: true });
        const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountBefore).not.to.equal(0);

        const configuration = { SOURCE_DATABASE_URL: SOURCE_DATABASE_URL, TARGET_DATABASE_URL: TARGET_DATABASE_URL, PG_RESTORE_JOBS: 4 };

        // when
        await run(configuration);

        // then
        const knowledgeElementsCountAfter = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountAfter).to.equal(knowledgeElementsCountBefore);

      });

    });

    context('when incremental restore is enabled', () => {

      [
        {
          name: 'answers',
          errorMessage: 'Answers table must not be empty on target database',
        },
        {
          name: '"knowledge-elements"',
          errorMessage: 'Knowledge-elements table must not be empty on target database',
        },
        {
          name: '"knowledge-element-snapshots"',
          errorMessage: 'Knowledge-element-snapshots table must not be empty on target database',
        },
      ].forEach((table) => {
        it(`should throw if table ${table.name} is empty`, async function() {

          // given

          sourceDatabase = await Database.create(sourceDatabaseConfig);
          const backupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

          targetDatabase = await Database.create(targetDatabaseConfig);

          // TODO: do not use production code to setup environment
          const firstDayConfiguration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true', RESTORE_FK_CONSTRAINTS: 'false', RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: undefined, PG_RESTORE_JOBS: 4 };
          await steps.restoreBackup({ backupFile, databaseUrl: targetDatabaseConfig.databaseUrl, configuration: firstDayConfiguration });

          // Day 2

          // given
          sourceDatabase = await Database.create(sourceDatabaseConfig);
          await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

          targetDatabase = await Database.create(targetDatabaseConfig);
          await createAndFillDatabase(targetDatabase, targetDatabaseConfig, { createTablesNotToBeImported: true });
          await targetDatabase.runSql(`DELETE FROM ${table.name}`);

          const configuration = { SOURCE_DATABASE_URL: SOURCE_DATABASE_URL,
            TARGET_DATABASE_URL: TARGET_DATABASE_URL,
            RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: 'true',
            PG_RESTORE_JOBS: 4 };

          // when
          const promise = run(configuration);

          // then
          return expect(promise).to.be.rejectedWith(table.errorMessage);
        });
      });

      it('should copy all missing values', async function() {

        // given

        // Day 1
        sourceDatabase = await Database.create(sourceDatabaseConfig);
        const backupFile = await createBackup(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });

        targetDatabase = await Database.create(targetDatabaseConfig);

        // TODO: do not use production code to setup environment
        const firstDayConfiguration = { RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS: 'true', RESTORE_FK_CONSTRAINTS: 'false', RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: undefined, PG_RESTORE_JOBS: 4 };
        await steps.restoreBackup({ backupFile, databaseUrl: targetDatabaseConfig.databaseUrl, configuration: firstDayConfiguration });

        const answersCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM answers'));
        expect(answersCountBefore).not.to.equal(0);

        const knowledgeElementsCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"'));
        expect(knowledgeElementsCountBefore).not.to.equal(0);

        const knowledgeElementSnapshotCountBefore = parseInt(await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-element-snapshots"'));
        expect(knowledgeElementSnapshotCountBefore).not.to.equal(0);

        // Day 2

        // given
        sourceDatabase = await Database.create(sourceDatabaseConfig);
        await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
        await sourceDatabase.runSql('INSERT INTO answers (id, "challengeId") VALUES (2,2)');
        await sourceDatabase.runSql('INSERT INTO answers (id, "challengeId") VALUES (3,2)');
        await sourceDatabase.runSql('INSERT INTO "knowledge-elements"  (id, "userId", "createdAt") VALUES (2, 2, CURRENT_TIMESTAMP)');
        await sourceDatabase.runSql('INSERT INTO "knowledge-elements"  (id, "userId", "createdAt") VALUES (3, 2, CURRENT_TIMESTAMP)');
        await sourceDatabase.runSql('INSERT INTO "knowledge-element-snapshots"  (id, "userId", "snappedAt", "snapshot") VALUES (2, 2, CURRENT_TIMESTAMP, \'{"id": "3"}\'::jsonb)');
        await sourceDatabase.runSql('INSERT INTO "knowledge-element-snapshots"  (id, "userId", "snappedAt", "snapshot") VALUES (3, 2, CURRENT_TIMESTAMP, \'{"id": "3"}\'::jsonb)');

        // given
        const configuration = { SOURCE_DATABASE_URL: SOURCE_DATABASE_URL, TARGET_DATABASE_URL: TARGET_DATABASE_URL, RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY: 'true', PG_RESTORE_JOBS: 4 };

        // when
        await run(configuration);

        // then
        const answersCount = await targetDatabase.runSql('SELECT  COUNT(1) FROM answers');
        const answersCountAfter = parseInt(answersCount);
        expect(answersCountAfter).to.equal(answersCountBefore + 2);

        // then
        const knowledgeElementsCount = await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-elements"');
        const knowledgeElementsCountAfter = parseInt(knowledgeElementsCount);
        expect(knowledgeElementsCountAfter).to.equal(knowledgeElementsCountBefore + 2);

        // then
        const knowledgeElementSnpashotCount = await targetDatabase.runSql('SELECT COUNT(1) FROM "knowledge-element-snapshots"');
        const knowledgeElementSnpashotCountfter = parseInt(knowledgeElementSnpashotCount);
        expect(knowledgeElementSnpashotCountfter).to.equal(knowledgeElementSnapshotCountBefore + 2);
        // TODO: check the rows copied have matching IDs

      });

    });

  });
});
