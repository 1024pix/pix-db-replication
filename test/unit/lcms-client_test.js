const { expect, axios, sinon, catchErr } = require('../test-helper');

const lcmsClient = require('../../src/lcms-client');

describe('Unit | lcms-client.js', () => {
  describe('#getLatest', () => {
    let learningContentGetUrl, configuration, headers;

    beforeEach(() => {
      const lcmsApiUrl = 'https://lcms-test.pix.fr/api';
      const lcmsApiKey = 'abcd';
      learningContentGetUrl = lcmsApiUrl + '/databases/airtable';
      headers = { 'Authorization': `Bearer ${lcmsApiKey}` };
      configuration = {
        LCMS_API_URL: lcmsApiUrl,
        LCMS_API_KEY: lcmsApiKey,
      };
    });

    it('should call LCMS API to get learning content latest release', async () => {
      // given
      const axiosResponse = {
        data: {},
        status: 'someStatus',
      };
      sinon.stub(axios, 'get').withArgs(learningContentGetUrl, { headers, timeout: 10000 }).resolves(axiosResponse);

      // when
      const response = await lcmsClient.getLearningContent(configuration);

      // then
      expect(response).to.equal(axiosResponse.data);
    });

    it('should return empty object from the http call when failed', async () => {
      const axiosError = {
        response: {
          data: Symbol('data'),
          status: 'someStatus',
        },
      };
      sinon.stub(axios, 'get').withArgs(learningContentGetUrl, { headers, timeout: 10000 }).rejects(axiosError);

      // when
      const error = await catchErr(lcmsClient.getLearningContent)(configuration);

      // then
      expect(error).not.to.be.null;
    });
  });
});
