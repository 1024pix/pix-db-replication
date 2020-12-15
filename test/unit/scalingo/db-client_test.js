const nock = require('nock');
const { expect } = require('chai');

const ScalingoDBClient = require('../../../src/scalingo/db-client');

const SCALINGO_REGION = 'SCALINGO_REGION';
const SCALINGO_DB_API_URL = `https://db-api.${SCALINGO_REGION}.scalingo.com`;

describe('Client wrapper for Scalingo Database API', () => {
  let client;
  const dbId = 'dbId1';

  beforeEach(() => {
    nock.cleanAll();
    nock.disableNetConnect();
  
    client = ScalingoDBClient.getInstance({
      dbId,
      dbToken: 'dbToken1',
      region: SCALINGO_REGION,
    });
  });

  describe('#ScalingoDBClient.getInstance', () => {
    it('should return the Scalingo client instance', async () => {
      expect(client).to.be.an.instanceof(ScalingoDBClient);
      expect(client.client).to.exist;
    });
  });

  describe('#ScalingoDBClient.getBackups', () => {
    it('should return the list of backups for the given addon', async () => {
      // given
      const backups = {
        database_backups: [
          {
            id: 'backup1',
            created_at: '2020-11-10T23:00:00.473+01:00',
            started_at: '2020-11-10T23:01:09.834+01:00',
            status: 'done',
          },
        ],
      };
      nock(SCALINGO_DB_API_URL).get(`/api/databases/${dbId}/backups`).reply(200, backups);
      // when
      const result = await client.getBackups();
      // then
      expect(result).to.be.deep.equal(backups.database_backups);
    });

    it('should throw an error if Scalingo database API call fails', async () => {
      // given
      nock(SCALINGO_DB_API_URL).get(`/api/databases/${dbId}/backups`).reply(503);
      // when
      try {
        await client.getBackups();
        expect.fail('should raise an error when backup for today not found');
      } catch (e) {
        expect(e.message).to.equal('Unable to get the backup with Scalingo Database API.');
      }
    });
  });

  describe('#ScalingoDBClient.getBackupDownloadLink', () => {
    const backupId = 'backupId';

    it('should return the backup download link for the given addon backup', async () => {
      // given
      const response = { download_url: 'https://domain.com/backup.tar.gz' };
      nock(SCALINGO_DB_API_URL).get(`/api/databases/${dbId}/backups/${backupId}/archive`).reply(200, response);
      // when
      const result = await client.getBackupDownloadLink(backupId);
      // then
      expect(result).to.be.deep.equal(response.download_url);
    });

    it('should throw an error if Scalingo database API call fails', async () => {
      // given
      nock(SCALINGO_DB_API_URL).get(`/api/databases/${dbId}/backups/${backupId}/archive`).reply(503);
      // when
      try {
        await client.getBackupDownloadLink(backupId);
        expect.fail('should raise an error when api call failed');
      } catch (e) {
        expect(e.message).to.equal('Unable to get the backup download link with Scalingo Database API.');
      }
    });
  });
});
