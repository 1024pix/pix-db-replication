require('dotenv').config();
const cron = require('node-cron');
const steps = require('./steps');

steps.scalingoSetup();

cron.schedule(process.env.SCHEDULE, async () => {
  try {
    await steps.fullReplicationAndEnrichment();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
});
