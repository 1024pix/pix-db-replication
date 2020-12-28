require('dotenv').config();

const logger = require('./logger');
const steps = require('./steps');

const extractConfigurationFromEnvironment = require ('./src/extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

async function main() {
  await steps.pgclientSetup(configuration);
  return steps.fullReplicationAndEnrichment(configuration);
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
process.on('unhandledRejection', () => { exitOnSignal('unhandledRejection'); });
process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
