import { expect, catchErr, nock } from '../../test-helper.js';
import {run} from '../../../src/steps/notification.js';


describe('Integration | Steps | notification.js', () => {
  describe('run', function() {
    it('should call all notification urls', async function () {
      const configuration = {
        NOTIFICATION_URLS: [
          { url: 'http://example.net/webhook1' },
          { url: 'http://example.net/webhook2' },
        ]
      };

      const scopeWebhook1 = nock('http://example.net')
        .post('/webhook1')
        .reply(200, {});

      const scopeWebhook2 = nock('http://example.net')
        .post('/webhook2')
        .reply(200, {});


      await run(configuration);

      expect(scopeWebhook1.isDone()).to.be.true;
      expect(scopeWebhook2.isDone()).to.be.true;
    });
  });
});
