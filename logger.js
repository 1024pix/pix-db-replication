const bunyan = require('bunyan');

const logger = bunyan.createLogger({
  name: 'pix-db-replication',
  stream: process.stdout,
  level: 'info'
});

module.exports = logger;
