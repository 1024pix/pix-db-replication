require('dotenv').config();

const logger = require('./logger');
const steps = require('./steps');

const Sentry = require('@sentry/node');
const initSentry = require('./sentry-init');

const { configuration } = require('./config');
const TIMEOUT = 2000;

async function main() {

  try {
    initSentry(configuration);

    await steps.pgclientSetup(configuration);
    return steps.fullReplicationAndEnrichment(configuration);
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
}

main()
  .then(async () => {
    await flushSentryAndExit(0);
  })
  .catch(async (error) => {
    logger.error('run main catch', { error });
    await flushSentryAndExit(1);
  });

async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  await flushSentryAndExit(1);
}

async function flushSentryAndExit(exitCode) {
  await Sentry.close(TIMEOUT);
  process.exit(exitCode);
}

process.on('uncaughtException', () => { exitOnSignal('uncaughtException'); });

process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  exitOnSignal('unhandledRejection');
});

process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
