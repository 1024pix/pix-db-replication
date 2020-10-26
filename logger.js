const bunyan = require('bunyan');
const repositoryName = 'pix-db-replication';
const loggedApplicationName = process.env.APP || repositoryName;

const logger = bunyan.createLogger({
  name: loggedApplicationName,
  stream: process.stdout,
  level: 'info'
});

module.exports = logger;
