const axios = require('axios');
const sinon = require('sinon');
const chai = require('chai');
const nock = require('nock');
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
  axios,
  catchErr,
  expect,
  nock,
  sinon,
};
