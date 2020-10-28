require('dotenv').config();

const logger = require('./logger');
const steps = require('./steps');

steps.scalingoSetup();

steps.fullReplicationAndEnrichment()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

