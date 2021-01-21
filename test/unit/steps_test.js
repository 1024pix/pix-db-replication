const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
chai.use(sinonChai);
const { expect } = chai;
const proxyquire = require('proxyquire').noPreserveCache();

describe('Unit | steps.js', () => {

  describe('#createBackup', () => {
    let execStub;
    let createBackup;

    beforeEach(() => {
      execStub = sinon.stub();
      const newSteps = proxyquire('../../src/steps', {
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

    context('when anwers and knowledge elements are restored incrementally', () => {
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
            '--exclude-table', 'answers'
          ],
          { stdio: 'inherit' }
        );

      });
    });

  });

});
