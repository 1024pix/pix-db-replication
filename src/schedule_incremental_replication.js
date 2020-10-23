require('dotenv').config();

const cron = require('node-cron');
const replicateIncrementally = require('./replicate-incrementally');
const logger = require('../logger');

cron.schedule(process.env.SCHEDULE, async () => {
  try {
    await replicateIncrementally.run();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
});
