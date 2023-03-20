const pgUrlParser = require('pg-connection-string').parse;
const Database = require('../utils/database');
const lcmsClient = require('../../src/lcms-client');
const { fetchAndSaveData } = require('../../src/replicate-learning-content');

const { expect, sinon } = require('../test-helper');
const mockLcmsGetAirtable = require('../utils/mock-lcms-get-airtable');

describe('Integration | replicate-learning-content.js', () => {
  let targetDatabaseConfig;
  let targetDatabase;

  before(async() => {
    // CircleCI set up environment variables to access DB, so we need to read them here
    // eslint-disable-next-line no-process-env
    const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';
    const config = pgUrlParser(DATABASE_URL);

    targetDatabaseConfig = {
      serverUrl: `postgres://${config.user}@${config.host}:${config.port}`,
      databaseName: config.database,
      tableName: 'test_table',
      tableRowCount: 100000,
    };

    targetDatabase = await Database.create(targetDatabaseConfig);
  });

  it('should import data', async function() {
    // given
    const configuration = {
      DATABASE_URL: `${targetDatabaseConfig.serverUrl}/${targetDatabaseConfig.databaseName}`,
    };
    const fullLearningContent = mockLcmsGetAirtable();
    sinon.stub(lcmsClient, 'getLearningContent').resolves(fullLearningContent);

    // when
    await fetchAndSaveData(configuration);

    // then
    const competenceRowCount = parseInt(await targetDatabase.runSql('SELECT COUNT(*) FROM competences'));
    expect(competenceRowCount).to.equal(6);
  });
});
