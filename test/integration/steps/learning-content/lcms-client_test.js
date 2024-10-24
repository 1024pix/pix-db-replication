import { expect, catchErr, nock } from '../../../test-helper.js';

import * as lcmsClient from '../../../../src/steps/learning-content/lcms-client.js';

describe('Integration | Steps | learning-content | lcms-client.js', function() {
  describe('#getLatest', function() {
    let configuration;

    beforeEach(function() {
      const lcmsApiUrl = 'https://lcms-test.pix.fr/api';
      const lcmsApiKey = 'abcd';
      configuration = {
        LCMS_API_URL: lcmsApiUrl,
        LCMS_API_KEY: lcmsApiKey,
      };
      nock.disableNetConnect();
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should call LCMS API to get learning content latest release', async function() {
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

    it('should throw an error when the response take more than the allowed time', async function() {
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
