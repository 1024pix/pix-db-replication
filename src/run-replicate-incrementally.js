const logger = require('./logger');
const runner = require('./replicate-incrementally');

const Sentry = require('@sentry/node');
const initSentry = require('./sentry-init');

const { configuration } = require('./config');

async function main() {
  initSentry(configuration);
  await runner.run(configuration);
}

main()
  .catch(async (error) => {
    logger.error(error);
    Sentry.captureException(error);
    await Sentry.close(2000);
    process.exit(1);
  });

async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  await Sentry.close(2000);
  process.exit(1);
}

process.on('uncaughtException', () => { exitOnSignal('uncaughtException'); });
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  exitOnSignal('unhandledRejection');
});
process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
