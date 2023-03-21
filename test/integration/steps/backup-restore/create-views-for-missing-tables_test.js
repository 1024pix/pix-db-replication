const { expect } = require('chai');
const pgUrlParser = require('pg-connection-string').parse;

// CircleCI set up environment variables to access DB, so we need to read them here
// eslint-disable-next-line no-process-env
const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';

const Database = require('../../../utils/database');

const createViewsForMissingTables = require('../../../../src/steps/backup-restore/create-views-for-missing-tables');

describe('Integration | Steps | Backup restore | createViewsForMissingTables', () => {
  let database;
  let configuration;

  beforeEach(async function() {
    const config = pgUrlParser(DATABASE_URL);

    const databaseConfig = {
      serverUrl: `postgres://${config.user}@${config.host}:${config.port || '5432'}`,
      databaseName: config.database,
      tableRowCount: 100000,
    };

    databaseConfig.databaseUrl = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;
    configuration = { DATABASE_URL: databaseConfig.databaseUrl };
    database = await Database.create(databaseConfig);
  });

  afterEach(async function() {
    await database.dropDatabase();
  });

  context('when the table \'schooling-registrations\' does not exists', () => {
    it('create a view schooling registrations', async function() {
      await database.runSql('CREATE TABLE "organization-learners" (id integer);');

      await createViewsForMissingTables(configuration);

      const result = await database.runSql('SELECT COUNT(viewname) FROM "pg_views" WHERE viewname = \'schooling-registrations\'');
      expect(result).to.equal('1');
    });
  });

  context('when the table \'schooling-registrations\' exists', () => {
    it('does not create a view schooling registrations', async function() {
      await database.runSql('CREATE TABLE "organization-learners" (id integer);');
      await database.runSql('CREATE TABLE "schooling-registrations" (id integer);');

      await createViewsForMissingTables(configuration);

      const result = await database.runSql('SELECT COUNT(viewname) FROM "pg_views" WHERE viewname = \'schooling-registrations\'');
      expect(result).to.equal('0');
    });
  });

});
