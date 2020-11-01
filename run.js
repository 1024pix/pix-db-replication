require('dotenv').config();

const logger = require('./logger');
const steps = require('./steps');

const extractConfigurationFromEnvironment = require ('./src/extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

steps.scalingoSetup();

steps.fullReplicationAndEnrichment(configuration)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

