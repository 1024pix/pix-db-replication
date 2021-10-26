const axios = require('axios');
const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

afterEach(() => {
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

module.exports = {
  expect,
  axios,
  sinon,
  catchErr,
};
