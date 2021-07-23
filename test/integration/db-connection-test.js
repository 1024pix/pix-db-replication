const pgUrlParser = require('pg-connection-string').parse;
const { expect } = require('chai');
const Database = require('../utils/database');

const dbConnection = require('../../src/db-connection');

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

      await dbConnection.dropTable(databaseConfig.tableName, databaseConfig);

      tableExists = await database.hasTable(databaseConfig.tableName);
      expect(tableExists).to.equal(false);
    });
  });

});
