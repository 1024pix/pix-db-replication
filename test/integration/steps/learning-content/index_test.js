import pgConnectionString from 'pg-connection-string';
const pgUrlParser = pgConnectionString.parse;

import { Database } from '../../../utils/database.js';
import { expect, sinon } from '../../../test-helper.js';
import { mockLcmsAirtableData } from '../../../utils/mock-lcms-get-airtable.js';
import * as databaseHelper from '../../../../src/database-helper.js';

import { run } from '../../../../src/steps/learning-content/index.js';

describe('Integration | Steps | learning-content | index.js', () => {
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
    const fullLearningContent = mockLcmsAirtableData();
    const lcmsClient = {
      getLearningContent: sinon.stub(),
    };
    lcmsClient.getLearningContent.resolves(fullLearningContent);

    // when
    await run(configuration, { lcmsClient, databaseHelper });

    // then
    const competenceRowCount = parseInt(await targetDatabase.runSql('SELECT COUNT(*) FROM competences'));
    expect(competenceRowCount).to.equal(6);
  });
});
