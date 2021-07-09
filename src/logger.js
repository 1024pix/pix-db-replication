const bunyan = require('bunyan');
const repositoryName = 'pix-db-replication';
// eslint-disable-next-line no-process-env
const loggedApplicationName = process.env.APP || repositoryName;
// eslint-disable-next-line no-process-env
const isTest = process.env.NODE_ENV;

const logger = bunyan.createLogger({
  name: loggedApplicationName,
  stream: process.stdout,
  level: isTest === 'test' ? 'fatal' : 'info',
});

module.exports = logger;
