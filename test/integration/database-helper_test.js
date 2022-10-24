const pgUrlParser = require('pg-connection-string').parse;
const _ = require('lodash');
const { expect, catchErr } = require('../test-helper');
const Database = require('../utils/database');
const mockLcmsGetAirtable = require('../utils/mock-lcms-get-airtable');
const databaseHelper = require('../../src/database-helper');
const { PrimaryKeyNotNullConstraintError } = require('../../src/errors');

describe('Integration | db-connection.js', () => {

  // eslint-disable-next-line no-process-env
  const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';
  const config = pgUrlParser(DATABASE_URL);

  const databaseConfig = {
    serverUrl: `postgres://${config.user}@${config.host}:${config.port}`,
    databaseName: config.database,
    tableName: 'test_table',
    tableRowCount: 100000,
  };
  databaseConfig.DATABASE_URL = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;

  let database;

  beforeEach(async function() {
    database = await Database.create(databaseConfig);
  });

  afterEach(async function() {
    await database.dropDatabase();
  });

  describe('#dropTable', function() {
    beforeEach(async function() {
      await database.runSql(
        `CREATE TABLE ${databaseConfig.tableName}(id int NOT NULL PRIMARY KEY)`,
        `COMMENT ON TABLE ${databaseConfig.tableName} IS 'test comment'`,
      );
    });

    it('should drop table', async function() {
      let tableExists;
      tableExists = await database.hasTable(databaseConfig.tableName);
      expect(tableExists).to.equal(true);

      await databaseHelper.dropTable(databaseConfig.tableName, databaseConfig);

      tableExists = await database.hasTable(databaseConfig.tableName);
      expect(tableExists).to.equal(false);
    });
  });

  describe('#createTable', function() {
    it('should create a table', async function() {
      const tableStructure = {
        name: 'competences',
        fields: [
          { name: 'name', type: 'text' },
          { name: 'areaId', type: 'text', isArray: false },
        ],
        indices: ['areaId'],
      };
      const tableName = tableStructure.name;

      await databaseHelper.createTable(tableStructure, databaseConfig);

      const tableExists = await database.hasTable(tableName);
      expect(tableExists).to.equal(true);
      const columnNamesAsString = await database.runSql(`SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}';`);
      expect(columnNamesAsString.split('\n').length).to.equal(3);
      const indexesAsString = await database.runSql(`SELECT * FROM pg_indexes WHERE tablename = '${tableName}';`);
      expect(indexesAsString.split('\n').length).to.equal(2);
    });
  });

  describe('#saveLearningContent', function() {

    beforeEach(async function() {
      await database.runSql(`
        CREATE TABLE "challenges"(
          "id" text PRIMARY KEY,
          "instructions" text,
          "timer" smallint,
          "autoReply" boolean,
          "skillIds" text [],
          "skillCount" smallint,
          "firstSkillId" text
        )
      `);
    });

    it('should insert data into table', async function() {
      const table = {
        name: 'challenges',
        fields: [
          { name: 'instructions', type: 'text' },
          { name: 'timer', type: 'smallint' },
          { name: 'autoReply', type: 'boolean' },
          { name: 'skillIds', type: 'text []', isArray: true },
          { name: 'skillCount', type: 'smallint', extractor: (record) => _.size(record['skillIds']) },
          { name: 'firstSkillId', type: 'text', extractor: (record) => _.get(record['skillIds'], 0) },
        ],
        indices: ['firstSkillId'],
      };
      const fullLearningContent = mockLcmsGetAirtable();
      const learningContent = fullLearningContent[table.name];

      await databaseHelper.saveLearningContent(table, learningContent, databaseConfig);

      const challengesCount = await database.runSql('select count(*) from "challenges"');
      expect(challengesCount).to.equal('7');
      const skillIdsCount = await database.runSql('select array_length("skillIds", 1) from "challenges"');
      const skillCount = await database.runSql('select "skillCount" from "challenges"');
      expect(skillIdsCount).to.deep.equal(skillCount);
    });

    it('should throw an error if the data to be inserted has no primary key', async function() {
      const table = {
        name: 'challenges',
        fields: [
          { name: 'instructions', type: 'text' },
          { name: 'timer', type: 'smallint' },
          { name: 'autoReply', type: 'boolean' },
          { name: 'skillIds', type: 'text []', isArray: true },
          { name: 'skillCount', type: 'smallint', extractor: (record) => _.size(record['skillIds']) },
          { name: 'firstSkillId', type: 'text', extractor: (record) => _.get(record['skillIds'], 0) },
        ],
        indices: ['firstSkillId'],
      };
      const fullLearningContent = {
        challenges: [{}],
      };
      const learningContent = fullLearningContent[table.name];

      const error = await catchErr(databaseHelper.saveLearningContent)(table, learningContent, databaseConfig);

      expect(error).to.be.instanceof(PrimaryKeyNotNullConstraintError);
    });

  });

});
