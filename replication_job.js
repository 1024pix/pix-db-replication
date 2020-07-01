require('dotenv').config();

const cron = require('node-cron');
const steps = require('./steps');
const logger = require('./logger');

steps.scalingoSetup();

cron.schedule(process.env.SCHEDULE, async () => {
  try {
    await steps.fullReplicationAndEnrichment();
  } catch(error) {
    logger.error(error);
    process.exit(1);
  }
});
