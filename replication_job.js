require('dotenv').config();
const cron = require('node-cron');
const steps = require('./steps');

cron.schedule(process.env.SCHEDULE, async () => {
  try {
    await steps.restoreLatestBackup();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
});
