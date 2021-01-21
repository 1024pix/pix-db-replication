require('dotenv').config();
const Sentry = require('@sentry/node');
const initSentry = require('./sentry-init');

const steps = require('./steps');
const logger = require('./logger');
const replicateIncrementally = require('./replicate-incrementally');

const Queue = require('bull');

const parisTimezone = 'Europe/Paris';

const extractConfigurationFromEnvironment = require('./extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();

const replicationQueue = addQueueEventsListeners(new Queue('Replication queue', configuration.REDIS_URL));
const airtableReplicationQueue = addQueueEventsListeners(new Queue('Airtable replication queue', configuration.REDIS_URL));
const incrementalReplicationQueue = addQueueEventsListeners(new Queue('Increment replication queue', configuration.REDIS_URL));

function addQueueEventsListeners(queue) {
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
      logger.error(`Failed job in ${queue.name}: ${job.id} ${err}`);
    });
}

async function main() {
  initSentry(configuration);
  await steps.pgclientSetup(configuration);

  replicationQueue.process(async function() {
    await steps.fullReplicationAndEnrichment(configuration);
    airtableReplicationQueue.add({});
  });

  airtableReplicationQueue.process(function() {
    return steps.importAirtableData(configuration);
  });

  incrementalReplicationQueue.process(function() {
    return replicateIncrementally.run(configuration);
  });

  replicationQueue.add({}, { repeat: { cron: configuration.SCHEDULE, tz: parisTimezone } });
  if (configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY && configuration.RESTORE_ANSWERS_AND_KES_INCREMENTALLY === 'true') {
    incrementalReplicationQueue.add({}, { repeat: { cron: configuration.SCHEDULE, tz: parisTimezone } });
  }
}

async function flushSentryAndExit() {
  const TIMEOUT = 2000;
  await Sentry.close(TIMEOUT);
  process.exit(1);
}

main()
  .catch(async (error) => {
    Sentry.captureException(error);
    logger.error(error);
    await flushSentryAndExit();
  });

async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  await flushSentryAndExit();
}

process.on('uncaughtException', () => {
  exitOnSignal('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  exitOnSignal('unhandledRejection');
});
process.on('SIGTERM', () => {
  exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  exitOnSignal('SIGINT');
});

