import toPairs from 'lodash/toPairs.js';
import { extractConfigurationFromEnvironment } from './extract-configuration-from-environment.js';

const configuration = extractConfigurationFromEnvironment();
const parisTimezone = 'Europe/Paris';

const jobOptions = {
  attempts: configuration.MAX_RETRY_COUNT,
  backoff: { type: 'exponential', delay: configuration.EXPONENTIAL_RETRY_DELAY },
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

export {
  configuration,
  jobOptions,
  repeatableJobOptions,
  REPLICATION_MODE,
  getTablesWithReplicationModes,
};
