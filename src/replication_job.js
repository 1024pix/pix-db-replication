require('dotenv').config();
const Sentry = require('@sentry/node');
const initSentry = require('./sentry-init');

const steps = require('./steps');
const logger = require('./logger');

const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const extractConfigurationFromEnvironment = require ('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

async function main() {
  try {
    initSentry(configuration);
    await steps.pgclientSetup(configuration);
    await startReplicationAndEnrichment();
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
}

main()
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

function startReplicationAndEnrichment() {
  new CronJob(configuration.SCHEDULE, async function() {
    try {
      await steps.fullReplicationAndEnrichment(configuration);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  }, null, true, parisTimezone);
}

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
