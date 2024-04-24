import pgConnectionString from 'pg-connection-string';
const pgUrlParser = pgConnectionString.parse;

import _ from 'lodash';
import { expect, catchErr } from '../test-helper.js';
import { Database } from '../utils/database.js';
import { mockLcmsAirtableData } from '../utils/mock-lcms-get-airtable.js';
import * as databaseHelper from '../../src/database-helper.js';
import { PrimaryKeyNotNullConstraintError } from '../../src/errors.js';

// eslint-disable-next-line n/no-process-env
const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';

describe('Integration | db-connection.js', function() {

  let databaseConfig;
  let database;

  beforeEach(async function() {
    const config = pgUrlParser(DATABASE_URL);

    databaseConfig = {
      serverUrl: `postgres://${config.user}@${config.host}:${config.port}`,
      databaseName: config.database,
      tableName: 'test_table',
      tableRowCount: 100000,
    };
    databaseConfig.DATABASE_URL = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;
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
        indexes: ['areaId'],
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
        indexes: ['firstSkillId'],
      };
      const fullLearningContent = mockLcmsAirtableData();
      const learningContent = fullLearningContent[table.name];

      await databaseHelper.saveLearningContent(table, learningContent, databaseConfig);

      const challengesCount = await database.runSql('select count(*) from "challenges"');
      expect(challengesCount).to.equal('7');
      const skillIdsCount = await database.runSql('select array_length("skillIds", 1) from "challenges"');
      const skillCount = await database.runSql('select "skillCount" from "challenges"');
      expect(skillIdsCount).to.deep.equal(skillCount);
    });

    context('when at least one of the collection item has no property', function() {
      it('should throw a PrimaryKeyNotNullConstraintError', async function() {
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
          indexes: ['firstSkillId'],
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
});
