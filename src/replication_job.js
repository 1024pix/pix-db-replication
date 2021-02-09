require('dotenv').config();
require('../sentry-config');

const steps = require('./steps');
const logger = require('./logger');

const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const extractConfigurationFromEnvironment = require ('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

async function main() {
  await steps.pgclientSetup(configuration);
  new CronJob(configuration.SCHEDULE, async function() {
    try {
      await steps.fullReplicationAndEnrichment(configuration);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }, null, true, parisTimezone);
}

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  process.exit(1);
}

process.on('uncaughtException', () => { exitOnSignal('uncaughtException'); });
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  exitOnSignal('unhandledRejection');
});
process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
