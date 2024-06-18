import { expect, nock } from '../../test-helper.js';
import { run } from '../../../src/steps/notification.js';

describe('Integration | Steps | notification.js', function() {
  describe('run', function() {
    it('should call all notification urls and use auth token when provided', async function() {
      const configuration = {
        NOTIFICATIONS: [
          { url: 'http://example.net/webhook1' },
          { url: 'http://example.net/webhook2', token: 'mon-super-token' },
        ],
      };

      const scopeWebhook1 = nock('http://example.net')
        .post('/webhook1')
        .reply(200, {});

      const scopeWebhook2 = nock('http://example.net')
        .post('/webhook2')
        .matchHeader('Authorization', 'mon-super-token')
        .reply(200, {});

      await run(configuration);

      expect(scopeWebhook1.isDone()).to.be.true;
      expect(scopeWebhook2.isDone()).to.be.true;
    });
  });
});
