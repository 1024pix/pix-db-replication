const extractConfigurationFromEnvironment = require('./extract-configuration-from-environment');

const configuration = extractConfigurationFromEnvironment();
const parisTimezone = 'Europe/Paris';

const jobOptions = {
  attempts: configuration.MAX_RETRY_COUNT,
  backoff: { type: 'exponential', delay: 100 }
};

const repeatableJobOptions = {
  ...jobOptions,
  repeat: { cron: configuration.SCHEDULE, tz: parisTimezone },
};

module.exports = {
  configuration,
  jobOptions,
  repeatableJobOptions,
};
