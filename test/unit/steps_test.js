const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
chai.use(sinonChai);
const { expect } = chai;
const proxyquire = require('proxyquire').noPreserveCache();

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

  describe('#createBackup', () => {

    let execStub;
    let createBackup;

    beforeEach(() => {
      execStub = sinon.stub();
      const newSteps = proxyquire('../../steps', {
        execa: execStub
      });
      createBackup = newSteps.createBackup;
    });

    it('should use pg_dump to create a full backup', async () => {
      // given
      const configuration = {
        SOURCE_DATABASE_URL: 'postgresql://source.url',
        RESTORE_ANSWERS_AND_KES: 'true',
      };

      // when
      const backupFilename = await createBackup(configuration);

      // then
      expect(execStub).to.have.been.calledWith(
        'pg_dump',
        [
          '--clean',
          '--if-exists',
          '--format', 'c',
          '--dbname', 'postgresql://source.url',
          '--no-owner',
          '--no-privileges',
          '--no-comments',
          '--exclude-schema',
          'information_schema',
          '--exclude-schema', '\'^pg_*\'',
          '--file', './dump.pgsql',
        ],
        { stdio: 'inherit' }
      );
      expect(backupFilename).to.equal('./dump.pgsql');
    });

    context('when answers and knowledge elements are restored incrementally', () => {

      it('should not backup answers and knowledge-elements tables', async () => {
        // given
        const configuration = {
          SOURCE_DATABASE_URL: 'postgresql://source.url',
          RESTORE_ANSWERS_AND_KES: 'false',
        };

        // when
        await createBackup(configuration);

        // then
        expect(execStub).to.have.been.calledWith(
          'pg_dump',
          [
            '--clean',
            '--if-exists',
            '--format', 'c',
            '--dbname', 'postgresql://source.url',
            '--no-owner',
            '--no-privileges',
            '--no-comments',
            '--exclude-schema',
            'information_schema',
            '--exclude-schema', '\'^pg_*\'',
            '--file', './dump.pgsql',
            '--exclude-table', 'knowledge-elements',
            '--exclude-table', 'knowledge-element-snapshots',
            '--exclude-table', 'knowledge-element-snapshots_id_seq',
            '--exclude-table', 'answers',

          ],
          { stdio: 'inherit' }
        );
      });
    });
  });

});
