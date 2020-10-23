require('dotenv').config();

const logger = require('../logger');
const runner = require('./replicate-incrementally');

runner.run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

