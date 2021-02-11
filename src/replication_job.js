require('dotenv').config();
const Sentry = require('@sentry/node');
const initSentry = require('./sentry-init');

const steps = require('./steps');
const logger = require('./logger');

const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const extractConfigurationFromEnvironment = require('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

async function main() {
  initSentry(configuration);
  await steps.pgclientSetup(configuration);
  await startReplicationAndEnrichment();
}

async function flushSentryAndExit() {
  const TIMEOUT = 2000;
  await Sentry.close(TIMEOUT);
  process.exit(1);
}

main()
  .catch(async (error) => {
    Sentry.captureException(error);
    logger.error(error);
    await flushSentryAndExit();
  });

function startReplicationAndEnrichment() {
  new CronJob(configuration.SCHEDULE, async function() {
    try {
      await steps.fullReplicationAndEnrichment(configuration);
    } catch (error) {
      logger.error(error);
      await flushSentryAndExit();
    }
  }, null, true, parisTimezone);
}

async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  await flushSentryAndExit();
}

process.on('uncaughtException', () => {
  exitOnSignal('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  exitOnSignal('unhandledRejection');
});
process.on('SIGTERM', () => {
  exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  exitOnSignal('SIGINT');
});
