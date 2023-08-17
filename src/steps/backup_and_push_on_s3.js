'use strict';

const { createBackup } = require('./backup-restore/index');


const logger = require('../logger');


async function run(configuration) {
  logger.info('Start dump full database');


  logger.info('Incremental replication done');
}

module.exports = {
  run,
};
