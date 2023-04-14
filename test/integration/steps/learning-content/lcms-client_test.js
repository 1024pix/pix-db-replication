const { expect, catchErr, nock } = require('../../../test-helper');

const lcmsClient = require('../../../../src/steps/learning-content/lcms-client');

describe('Integration | Steps | learning-content | lcms-client.js', () => {
  describe('#getLatest', () => {
    let configuration;

    beforeEach(() => {
      const lcmsApiUrl = 'https://lcms-test.pix.fr/api';
      const lcmsApiKey = 'abcd';
      configuration = {
        LCMS_API_URL: lcmsApiUrl,
        LCMS_API_KEY: lcmsApiKey,
      };
      nock.disableNetConnect();
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should call LCMS API to get learning content latest release', async () => {
      // given
      nock('https://lcms-test.pix.fr', {
        reqheaders: {
          authorization: 'Bearer abcd',
          client: 'pix-db-replication',
        } })
        .get('/api/databases/airtable')
        .reply(200, '{}');

      // when
      const response = await lcmsClient.getLearningContent(configuration);

      // then
      expect(response).to.deep.equal({});
    });

    it('should throw an error when the response take more than the allowed time', async () => {
      // given
      nock('https://lcms-test.pix.fr', {
        reqheaders: {
          authorization: 'Bearer abcd',
          client: 'pix-db-replication',
        } })
        .get('/api/databases/airtable')
        .delay(100)
        .reply(200, '{}');

      configuration.timeout = 50;

      // when
      const err = await catchErr(lcmsClient.getLearningContent)(configuration);

      // then
      expect(err.name).to.equal('CanceledError');
    });
  });
});
