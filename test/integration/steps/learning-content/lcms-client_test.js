import { expect, nock } from '../../../test-helper.js';

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
        .get('/api/replication-stream')
        .reply(200, '{"foo":1}\n{"bar":2}');

      // when
      const result = [];
      for await (const value of lcmsClient.streamLearningContent(configuration)) {
        result.push(value);
      }

      // then
      expect(result).to.deep.equal([{ foo: 1 }, { bar: 2 }]);
    });
  });
});
