require('dotenv').config();

const logger = require('./logger');
const steps = require('./steps');

const Sentry = require('@sentry/node');
const initSentry = require('./sentry-init');

const extractConfigurationFromEnvironment = require ('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

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
  .then(() => {
    process.exit(0);
  })
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
