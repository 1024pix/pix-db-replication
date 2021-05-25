require('dotenv').config();
const Sentry = require('@sentry/node');
const Queue = require('bull');
const initSentry = require('./sentry-init');
const steps = require('./steps');
const logger = require('./logger');
const replicateIncrementally = require('./replicate-incrementally');
const extractConfigurationFromEnvironment = require('./extract-configuration-from-environment');

const configuration = extractConfigurationFromEnvironment();
const parisTimezone = 'Europe/Paris';

const replicationQueue = _createQueue('Replication queue');
const airtableReplicationQueue = _createQueue('Airtable replication queue');
const incrementalReplicationQueue = _createQueue('Incremental replication queue');

main()
  .catch(async (error) => {
    Sentry.captureException(error);
    logger.error(error);
    await _flushSentryAndExit();
  });

async function main() {
  initSentry(configuration);
  await steps.pgclientSetup(configuration);
  const jobOptions = {
    attempts: configuration.MAX_RETRY_COUNT,
    repeat: { cron: configuration.SCHEDULE, tz: parisTimezone },
    backoff: { type: 'exponential', delay: 100 }
  };

  replicationQueue.process(async function() {
    await steps.fullReplicationAndEnrichment(configuration);
    airtableReplicationQueue.add({}, jobOptions);
  });

  airtableReplicationQueue.process(function() {
    return steps.importAirtableData(configuration);
  });

  incrementalReplicationQueue.process(function() {
    return replicateIncrementally.run(configuration);
  });
  replicationQueue.add({}, jobOptions);
  if (configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY && configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'true') {
    incrementalReplicationQueue.add({}, jobOptions);
  }
}

async function _exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  await _flushSentryAndExit();
}

process.on('uncaughtException', () => {
  _exitOnSignal('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  _exitOnSignal('unhandledRejection');
});
process.on('SIGTERM', () => {
  _exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  _exitOnSignal('SIGINT');
});

function _createQueue(name) {
  const queue = new Queue(name, configuration.REDIS_URL);
  _addQueueEventsListeners(queue);
  return queue;
}

function _addQueueEventsListeners(queue) {
  return queue
    .on('error', function(error) {
      logger.error(`Error in ${queue.name}: ${error}`);
    })
    .on('active', function(job) {
      logger.info(`Starting job in ${queue.name}: ${job.id}`);
    })
    .on('stalled', function(job) {
      logger.error(`Stalled job in ${queue.name}: ${job.id}`);
    })
    .on('completed', function(job) {
      logger.info(`Completed job in ${queue.name}: ${job.id}`);
    })
    .on('failed', function(job, err) {
      logger.error(`Failed job in ${queue.name}: ${job.id} ${err} (Number of attempts: ${job.attemptsMade}/${job.opts.attempts})`);
    });
}

async function _flushSentryAndExit() {
  const TIMEOUT = 2000;
  await Sentry.close(TIMEOUT);
  process.exit(1);
}

