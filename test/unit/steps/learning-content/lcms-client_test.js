import { expect, axios, sinon, catchErr } from '../../../test-helper.js';

import * as lcmsClient from '../../../../src/steps/learning-content/lcms-client.js';

describe('Unit | Steps | learning content | lcms-client.js', function() {
  describe('#getLatest', function() {
    let learningContentGetUrl, configuration, headers;

    beforeEach(function() {
      const lcmsApiUrl = 'https://lcms-test.pix.fr/api';
      const lcmsApiKey = 'abcd';
      learningContentGetUrl = lcmsApiUrl + '/databases/airtable';
      headers = {
        'Authorization': `Bearer ${lcmsApiKey}`,
        client: 'pix-db-replication',
      };
      configuration = {
        LCMS_API_URL: lcmsApiUrl,
        LCMS_API_KEY: lcmsApiKey,
      };
    });

    it('should call LCMS API to get learning content latest release', async function() {
      // given
      const axiosResponse = {
        data: {},
        status: 'someStatus',
      };
      sinon.stub(axios, 'get').withArgs(learningContentGetUrl, { headers, signal: sinon.match.any }).resolves(axiosResponse);

      // when
      const response = await lcmsClient.getLearningContent(configuration);

      // then
      expect(response).to.equal(axiosResponse.data);
    });

    it('should return empty object from the http call when failed', async function() {
      const axiosError = {
        response: {
          data: Symbol('data'),
          status: 'someStatus',
        },
      };
      sinon.stub(axios, 'get').withArgs(learningContentGetUrl, { headers, signal: sinon.match.any }).rejects(axiosError);

      // when
      const error = await catchErr(lcmsClient.getLearningContent)(configuration);

      // then
      expect(error).not.to.be.null;
    });
  });
});
