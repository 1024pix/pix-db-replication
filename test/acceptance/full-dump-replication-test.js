const { expect } = require('chai');
const { after, before, describe, it } = require('mocha');
const { createAndFillDatabase } = require('../integration/test-helper');
const Database = require('../utils/database');
const pgUrlParser = require('pg-connection-string').parse;

const steps = require('../../src/steps');

async function getCountFromTable({ targetDatabase, tableName }) {
  return parseInt(await targetDatabase.runSql(`SELECT COUNT(*) FROM ${tableName}`));
}

describe('Acceptance | steps | fullReplicationAndEnrichment', () => {
  // CircleCI set up environment variables to access DB, so we need to read them here
  // eslint-disable-next-line no-process-env
  const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://pix@localhost:5432/replication_source';
  // eslint-disable-next-line no-process-env
  const TARGET_DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';

  let sourceDatabase;
  let targetDatabase;
  let sourceDatabaseConfig;
  let targetDatabaseConfig;

  const configuration = {
    SOURCE_DATABASE_URL,
    TARGET_DATABASE_URL,
    DATABASE_URL: TARGET_DATABASE_URL,
    BACKUP_MODE: {},
    PG_RESTORE_JOBS: 1,
    AIRTABLE_API_KEY: 'keyblo10ZCvCqBAJg',
    AIRTABLE_BASE: 'app3fvsqhtHJntXaC',
  };

  before(async function() {
    this.timeout(5000);

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

    // given
    sourceDatabase = await Database.create(sourceDatabaseConfig);
    await createAndFillDatabase(sourceDatabase, sourceDatabaseConfig, { createTablesNotToBeImported: true });
    targetDatabase = await Database.create(targetDatabaseConfig);

    // when
    await steps.fullReplicationAndEnrichment(configuration);
  });

  after(async () => {
    await sourceDatabase.dropDatabase();
    await targetDatabase.dropDatabase();
  });

  describe('should import database data', () => {
    it('should replicate answers and knowledge-elements and knowledge-element-snapshots', async () => {
      // then
      const restoredRowCount = await getCountFromTable({ targetDatabase, tableName: targetDatabaseConfig.tableName });

      expect(restoredRowCount).to.equal(targetDatabaseConfig.tableRowCount);

      const isAnswersRestored = parseInt(
        await targetDatabase.runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''),
      );
      expect(isAnswersRestored).to.equal(1);

      // then
      const isKnowledgeElementsRestored = parseInt(
        await targetDatabase.runSql(
          'SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''
        ),
      );
      expect(isKnowledgeElementsRestored).to.equal(1);

      // then
      const isKnowledgeElementSnapshotsRestored = parseInt(
        await targetDatabase.runSql(
          'SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-element-snapshots\''
        ),
      );
      expect(isKnowledgeElementSnapshotsRestored).to.equal(1);

      const indexCount = parseInt(
        await targetDatabase.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'users_createdAt_idx\''),
      );
      expect(indexCount).to.equal(1);
    });
  });

  describe('should import Airtable data', () => {
    before(() => steps.importAirtableData(configuration));

    it('should import areas ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'areas' });
      expect(result).to.be.above(0);
    });

    it('should import attachments ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'attachments' });
      expect(result).to.be.above(0);
    });

    it('should import competences ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'competences' });
      expect(result).to.be.above(0);
    });

    it('should import tubes ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'tubes' });
      expect(result).to.be.above(0);
    });

    it('should import skills ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'skills' });
      expect(result).to.be.above(0);
    });

    it('should import challenges ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'challenges' });
      expect(result).to.be.above(0);
    });

    it('should import tutorials ', async () => {
      // then
      const result = await getCountFromTable({ targetDatabase, tableName: 'tutorials' });
      expect(result).to.be.above(0);
    });
  });

  describe('should enrich imported data', () => {
    it('should create indexes', async function() {
      // then
      const indexCount = parseInt(
        await targetDatabase.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'users_createdAt_idx\''),
      );
      expect(indexCount).to.equal(1);

      // then
      const KEIndexCount = parseInt(
        await targetDatabase.runSql(
          'SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'knowledge-elements_createdAt_idx\''
        ),
      );
      expect(KEIndexCount).to.equal(1);

      // then
      const KESnapshotsIndexCount = parseInt(
        await targetDatabase.runSql(
          'SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'knowledge-element-snapshots_snappedAt_idx\''
        ),
      );
      expect(KESnapshotsIndexCount).to.equal(1);

      // then
      const answersIndexCount = parseInt(
        await targetDatabase.runSql(
          'SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'answers_challengeId_idx\''
        ),
      );
      expect(answersIndexCount).to.equal(1);
    });

    it('should create view students', async function() {
      // then
      const viewCount = parseInt(
        await targetDatabase.runSql('SELECT COUNT(1) FROM pg_views vws WHERE vws.viewname = \'students\';'),
      );
      expect(viewCount).to.equal(1);
    });
  });
});
