import axios from 'axios';
import sinon from 'sinon';
import * as chai from 'chai';
import nock from 'nock';
const { expect } = chai;
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(function() {
  sinon.restore();
});

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

// eslint-disable-next-line mocha/no-exports
export {
  axios,
  catchErr,
  expect,
  nock,
  sinon,
};
