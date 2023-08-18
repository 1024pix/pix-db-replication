'use strict';

const AWS = require('aws-sdk');
const fs = require('fs').promises;
const moment = require('moment');

const { createBackup } = require('./backup-restore/index');
const logger = require('../logger');

function createS3Client(configuration) {
  return new AWS.S3({
    accessKeyId: configuration.S3_ACCESS_KEY,
    secretAccessKey: configuration.S3_SECRET_ACCESS_KEY,
    endpoint: configuration.S3_ENDPOINT,
    region: configuration.S3_REGION,
    sslEnabled: configuration.S3_SSL_ENABLED,
    s3ForcePathStyle: true,
  });
}

async function run({ configuration, injectedCreateBackup = createBackup, injectedCreateS3Client = createS3Client, injectedFs = fs }) {
  logger.info('Uploading dump to S3 bucket..');

  const dumpFilename = await injectedCreateBackup({ configuration, tablesToExcludeFromBackup: [] });

  logger.info('End dump full database');

  const s3 = injectedCreateS3Client(configuration);

  const blob = await injectedFs.readFile(dumpFilename);

  const currentDate = moment().format('YYYYMMDD-HHmmss');

  logger.info('Start upload dump database to S3');

  const objectName = `${configuration.S3_OBJECT_NAME_PREFIX}-${currentDate}`;

  await s3.upload(
    {
      Bucket: configuration.S3_BUCKET_NAME,
      Key: objectName,
      Body: blob,
    }).promise();

  logger.info('Dump successfully uploaded');
}

module.exports = {
  run,
};
