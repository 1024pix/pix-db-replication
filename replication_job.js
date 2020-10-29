require('dotenv').config();

const steps = require('./steps');
const logger = require('./logger');

const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

steps.scalingoSetup();

new CronJob(process.env.SCHEDULE, async function() {
  try {
    await steps.fullReplicationAndEnrichment();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}, null, true, parisTimezone);

