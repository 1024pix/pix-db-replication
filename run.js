require('dotenv').config();

const logger = require('./logger');
const steps = require('./steps');

const extractConfigurationFromEnvironment = require ('./src/extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

async function main() {
  await steps.scalingoSetup(configuration);
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

