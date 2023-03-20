const toPairs = require('lodash/toPairs');
const extractConfigurationFromEnvironment = require('./extract-configuration-from-environment');

const configuration = extractConfigurationFromEnvironment();
const parisTimezone = 'Europe/Paris';

const jobOptions = {
  attempts: configuration.MAX_RETRY_COUNT,
  backoff: { type: 'exponential', delay: 100 },
};

const repeatableJobOptions = {
  ...jobOptions,
  repeat: { cron: configuration.SCHEDULE, tz: parisTimezone },
};

const REPLICATION_MODE = {
  INCREMENTAL: 'incremental',
  TO_EXCLUDE: 'none',
};

function getTablesWithReplicationModes(configuration, modes = []) {
  const tablePairs = toPairs(configuration.BACKUP_MODE);
  return tablePairs
    .filter(([_, mode]) => modes.includes(mode))
    .map(([tableName, _]) => tableName);
}

module.exports = {
  configuration,
  jobOptions,
  repeatableJobOptions,
  REPLICATION_MODE,
  getTablesWithReplicationModes,
};
