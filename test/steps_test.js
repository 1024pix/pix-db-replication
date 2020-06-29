const { expect } = require('chai');

const { retryFunction } = require('../steps');

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
  });

});
