import pgConnectionString from 'pg-connection-string';
const pgUrlParser = pgConnectionString.parse;

import { Database } from '../../../utils/database.js';
import { expect, sinon } from '../../../test-helper.js';
import { mockModulixLcmsContent } from '../../../utils/mock-modulix-lcms-content.js';
import * as databaseHelper from '../../../../src/database-helper.js';

import { run } from '../../../../src/steps/modulix-learning-content/index.js';

describe('Integration | Steps | modulix-learning-content | index.js', function() {
  let targetDatabaseConfig;
  let targetDatabase;

  before(async function() {
    // CircleCI set up environment variables to access DB, so we need to read them here
    // eslint-disable-next-line n/no-process-env
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
    const fullLearningContent = mockModulixLcmsContent();
    const modulixLcmsClient = {
      getLearningContent: sinon.stub(),
    };
    modulixLcmsClient.getLearningContent.resolves(fullLearningContent);

    // when
    await run(configuration, { modulixLcmsClient, databaseHelper });

    // then
    const moduleRowCount = Number.parseInt(await targetDatabase.runSql('SELECT COUNT(*) FROM modules'));
    expect(moduleRowCount).to.equal(3);

    const columnNames = await targetDatabase.runSql('SELECT column_name FROM information_schema.columns where table_schema= \'public\' AND table_name = \'modules\'');
    expect(columnNames).to.include('id');
    expect(columnNames).to.include('shortId');
    expect(columnNames).to.include('slug');
    expect(columnNames).to.include('title');
    expect(columnNames).to.include('filename');
    expect(columnNames).to.include('level');
    expect(columnNames).to.include('duration');
    expect(columnNames).to.include('objectives');
    expect(columnNames).to.include('isBeta');
    expect(columnNames).to.include('visibility');
  });
});
