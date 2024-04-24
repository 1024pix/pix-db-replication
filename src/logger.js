import * as bunyan from 'bunyan';
const repositoryName = 'pix-db-replication';
// eslint-disable-next-line n/no-process-env
const loggedApplicationName = process.env.APP || repositoryName;
// eslint-disable-next-line n/no-process-env
const isTest = process.env.NODE_ENV;

const logger = bunyan.createLogger({
  name: loggedApplicationName,
  stream: process.stdout,
  level: isTest === 'test' ? 'fatal' : 'info',
});

export { logger };
