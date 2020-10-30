require('dotenv').config();

const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const replicateIncrementally = require('./replicate-incrementally');
const logger = require('../logger');

new CronJob(process.env.SCHEDULE, async function() {
  try {
    await replicateIncrementally.run();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}, null, true, parisTimezone);

