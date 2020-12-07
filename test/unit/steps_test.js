const { expect } = require('chai');

const { retryFunction } = require('../../steps');

function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
      return 'should have thrown an error';
    } catch (err) {
      return err;
    }
  };
}

describe('Unit | steps.js', () => {

  describe('#retryFunction', () => {

    it('should throw error if all retries fail', async function() {
      // given
      this.timeout(5000);
      const failedInputFunction = async () => {
        return Promise.reject(new Error());
      };

      // when
      const error = await catchErr(retryFunction)(failedInputFunction, 1);

      // then
      expect(error).to.be.instanceOf(Error);
    });

    it('should maximum retries equals to MAX_RETRY_COUNT value', async function() {

      // given
      this.timeout(5000);
      const expectedNbRetries = 10;
      let nbRetries = -1;
      const failedInputFunction = async () => {
        ++nbRetries;
        return Promise.reject(new Error());
      };

      // when
      const error = await catchErr(retryFunction)(failedInputFunction, expectedNbRetries);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(nbRetries).to.be.equal(expectedNbRetries);
    });

    it('should first retry start after (MIN_TIMEOUT) and retry each (MAX_TIMEOUT) until reach (MAX_RETRY_COUNT)', async function() {

      // given
      this.timeout(1000);
      const expectedNbRetries = 3;
      const startFirstRetryAfterThreeSecond = 200;
      const maxTimeBetweenTwoRetries = 200;

      let nbRetries = -1;
      const failedInputFunction = async () => {
        ++nbRetries;
        return Promise.reject(new Error());
      };

      // when
      const error = await catchErr(retryFunction)(failedInputFunction, expectedNbRetries, startFirstRetryAfterThreeSecond, maxTimeBetweenTwoRetries);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(nbRetries).to.be.equal(expectedNbRetries);
    });
  });

});
