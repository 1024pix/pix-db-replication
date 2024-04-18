const isFeatureEnabled = function(environmentVariable) {
  return environmentVariable === 'true';
};

const _getNumber = function(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
};

const initSentry = function(configuration) {
  const Sentry = require('@sentry/node');

  Sentry.init({
    enabled: isFeatureEnabled(configuration.SENTRY_ENABLED),
    dsn: configuration.SENTRY_DSN,
    environment: (configuration.SENTRY_ENVIRONMENT || 'development'),
    maxBreadcrumbs: _getNumber(configuration.SENTRY_MAX_BREADCRUMBS, 100),
    debug: isFeatureEnabled(configuration.SENTRY_DEBUG),
    maxValueLength: configuration.SENTRY_MAX_VALUE_LENGTH || 1000,
  });
};

export { initSentry };
