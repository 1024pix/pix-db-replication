const logger = require('../logger');
const runner = require('./replicate-incrementally');

const extractConfigurationFromEnvironment = require ('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

try {
  runner.run(configuration);
  process.exit(0);
}
catch (error)  {
  logger.error(error);
  process.exit(1);
}
