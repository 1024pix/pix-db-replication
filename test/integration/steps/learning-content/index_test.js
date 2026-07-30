import pgConnectionString from 'pg-connection-string';
const pgUrlParser = pgConnectionString.parse;

import { Database } from '../../../utils/database.js';
import { expect, sinon } from '../../../test-helper.js';
import { mockLearningContentStream } from '../../../utils/mock-learning-content.js';
import * as databaseHelper from '../../../../src/database-helper.js';

import { run } from '../../../../src/steps/learning-content/index.js';

describe('Integration | Steps | learning-content | index.js', function() {
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
  });

  beforeEach(async function() {
    targetDatabase = await Database.create(targetDatabaseConfig);
  });

  it('should import data', async function() {
    // given
    const configuration = {
      DATABASE_URL: `${targetDatabaseConfig.serverUrl}/${targetDatabaseConfig.databaseName}`,
    };
    const lcmsClient = {
      streamLearningContent: sinon.stub(),
    };
    lcmsClient.streamLearningContent.returns(mockLearningContentStream());

    // when
    await run(configuration, { lcmsClient, databaseHelper });

    // then
    const competenceRowCount = parseInt(await targetDatabase.runSql('SELECT COUNT(*) FROM competences'));
    expect(competenceRowCount).to.equal(6);
  });

  describe('input data edge cases', function() {
    it('should import data with string array that has special characters inside each element', async function() {
      // given
      const configuration = {
        DATABASE_URL: `${targetDatabaseConfig.serverUrl}/${targetDatabaseConfig.databaseName}`,
      };
      const lcmsClient = {
        streamLearningContent: sinon.stub(),
      };

      function mockLearningContentWithWeirdChallenge() {
        return {
          challenges: [
            {
              'airtableId': 'rec0hSrPM5bHqMP8T',
              'alternativeInstruction': '',
              'autoReply': true,
              'competenceId': 'recKxnZJh5dyRCQQn',
              'embedHeight': 500,
              'format': 'mots',
              'focusable': true,
              'id': 'rec0hSrPM5bHqMP8T',
              'instruction': 'Quelles sont les dates des deux guerres mondiales ?',
              'locales': [
                'fr',
                'fr-fr',
              ],
              'preview': 'http://staging.pix.fr/challenges/rec0hSrPM5bHqMP8T/preview',
              'proposals': 'Dates :\n.${date1}\n.${date2}',
              'skillId': 'recWAozQQmkLzs15C',
              'solution': 'groupe1:\n- 14 18\n- 1914 1918\ngroupe2:\n- 39 45\n- 1939 1945',
              'status': 'validé',
              't1Status': false,
              't2Status': false,
              't3Status': false,
              'deafAndHardOfHearing': 'OK',
              'requireGafamWebsiteAccess': true,
              'isIncompatibleIpadCertif': true,
              'toRephrase': true,
              'isAwarenessChallenge': true,
              'isQualityOk': true,
              'assessmentMaintenanceTags': ['MOT, AUTRE MOT', 'ENSUITRE "TUT" \\n'],
              'translationMaintenanceTags': ['question outil'],
            },
          ],
        };
      }

      lcmsClient.streamLearningContent.returns(mockLearningContentStream(mockLearningContentWithWeirdChallenge));

      // when
      await run(configuration, { lcmsClient, databaseHelper });

      // then
      const challenges = await targetDatabase.runSql('SELECT "assessmentMaintenanceTags" FROM challenges');
      expect(challenges).to.equal('{"MOT, AUTRE MOT","ENSUITRE \\"TUT\\" \\\\n"}');
    });
  });
});
