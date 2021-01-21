const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const replicateIncrementally = require('./replicate-incrementally');
const logger = require('./logger');
const Sentry = require('@sentry/node');

const extractConfigurationFromEnvironment = require ('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

new CronJob(configuration.SCHEDULE, async function() {
  try {
    await replicateIncrementally.run(configuration);
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
    process.exit(1);
  }
}, null, true, parisTimezone);

