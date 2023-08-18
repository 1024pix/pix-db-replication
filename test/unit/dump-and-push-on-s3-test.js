const { before, describe, it } = require('mocha');
const { expect, sinon } = require('../test-helper');
const { run: runDumpAndCopy } = require('../../src/steps/dump-and-push-on-S3');

describe('Acceptance | Dump database and push on S3', () => {

  // CircleCI set up environment variables to access DB, so we need to read them here
  // eslint-disable-next-line no-process-env
  const SOURCE_DATABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgres://pix@localhost:5432/replication_source';
  const s3Stub = {
    upload: undefined,
  };
  const promiseStub = {
    promise: undefined,
  };

  let createS3ClientStub;
  let createBackupStub;
  const fsStub = {
    readFile: undefined,
  };

  const configuration = {
    SOURCE_DATABASE_URL,
    BACKUP_MODE: {},
    PG_RESTORE_JOBS: 1,
    S3_ACCESS_KEY: 'pix-admin',
    S3_SECRET_ACCESS_KEY: 'pix-admin-password',
    S3_ENDPOINT: 'localhost:9000',
    S3_REGION: '',
    S3_BUCKET_NAME: 'test-bucket',
    S3_OBJECT_NAME_PREFIX: 'test',
    S3_SSL_ENABLED: false,
  };

  before(async function() {
    fsStub.readFile = sinon.stub();
    createBackupStub = sinon.stub();
    s3Stub.upload = sinon.stub();
    createS3ClientStub = sinon.stub();
    promiseStub.promise = sinon.stub();

    createS3ClientStub.returns(s3Stub);
    s3Stub.upload.returns(promiseStub);
  });

  describe('should dump database data and push S3', () => {

    it('should upload the dump to S3 bucket', async () => {
      promiseStub.promise.returns(sinon.promise().resolve());
      createBackupStub.returns('/backup-file.sql');
      fsStub.readFile.returns('Hello Pix!');

      await runDumpAndCopy({
        configuration,
        injectedCreateS3Client: createS3ClientStub,
        injectedCreateBackup: createBackupStub,
        injectedFs: fsStub,
      });

      expect(createBackupStub).to.have.been.calledOnceWith({ configuration, tablesToExcludeFromBackup: [] });
      expect(fsStub.readFile).to.have.been.calledOnceWith('/backup-file.sql');
      expect(createS3ClientStub).to.have.been.calledOnceWith(configuration);
      expect(s3Stub.upload).to.have.been.calledOnce;
      expect(s3Stub.upload.getCall(0).args[0].Bucket).to.be.equal('test-bucket');
    });
  });
});
