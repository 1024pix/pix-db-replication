require('dotenv').config();

const steps = require('./steps');
const logger = require('./logger');

const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

const extractConfigurationFromEnvironment = require ('./src/extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

steps.scalingoSetup(configuration);

new CronJob(configuration.SCHEDULE, async function() {
  try {
    await steps.fullReplicationAndEnrichment(configuration);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}, null, true, parisTimezone);

