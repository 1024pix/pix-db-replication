/* eslint no-process-env: "off" */

const logger = require('./logger');

const extractConfigurationFromEnvironment = function() {
  loadEnvironmentVariableFromFileIfNotOnPaas();
  const extractedConfiguration = extractConfigurationFromEnvironmentVariable();

  logger.info(extractedConfiguration, { extractedConfiguration });
  return extractedConfiguration;
};

const loadEnvironmentVariableFromFileIfNotOnPaas = function() {
  if (process.env.NODE_ENV && (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test')) {
    return;
  } else {
    require('dotenv').config();
  }
};

const extractConfigurationFromEnvironmentVariable = function() {
  return {
    PG_CLIENT_VERSION: process.env.PG_CLIENT_VERSION || 12,
    RETRIES_TIMEOUT_MINUTES: extractInteger(process.env.RETRIES_TIMEOUT_MINUTES) || 180,
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || 'keyblo10ZCvCqBAJg',
    AIRTABLE_BASE: process.env.AIRTABLE_BASE || 'app3fvsqhtHJntXaC',
    SCHEDULE: process.env.SCHEDULE || '10 5 * * *',
    MAX_RETRY_COUNT: extractInteger(process.env.MAX_RETRY_COUNT) || 10,
    MIN_TIMEOUT: extractInteger(process.env.MIN_TIMEOUT) || 900000, // 15 min
    MAX_TIMEOUT: extractInteger(process.env.MAX_TIMEOUT) || 900000, // 15 min
    PG_RESTORE_JOBS: extractInteger(process.env.PG_RESTORE_JOBS) || 4,
    RESTORE_FK_CONSTRAINTS: process.env.RESTORE_FK_CONSTRAINTS || 'true',
    RESTORE_ANSWERS_AND_KES: process.env.RESTORE_ANSWERS_AND_KES || 'true',
    RESTORE_ANSWERS_AND_KES_INCREMENTALLY: process.env.RESTORE_ANSWERS_AND_KES_INCREMENTALLY || 'false',
    SOURCE_DATABASE_URL: process.env.SOURCE_DATABASE_URL || 'postgresql://source_user@localhost/source_database',
    TARGET_DATABASE_URL: process.env.TARGET_DATABASE_URL || 'postgresql://target_user@localhost/target_database',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://target_user@localhost/target_database',
    SENTRY_ENABLED: process.env.SENTRY_ENABLED,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || 'development',
    SENTRY_MAX_BREADCRUMBS: process.env.SENTRY_MAX_BREADCRUMBS,
    SENTRY_DEBUG: process.env.SENTRY_DEBUG,
    SENTRY_MAX_VALUE_LENGTH: 1000,
    REDIS_URL : process.env.REDIS_URL || 'redis://redis/1'
  };
};

const extractInteger = function(arg) {
  return parseInt(arg, 10);
};

module.exports = extractConfigurationFromEnvironment;
