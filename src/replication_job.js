require('dotenv').config();
const Sentry = require('@sentry/node');
const Queue = require('bull');
const initSentry = require('./sentry-init');
const steps = require('./steps');
const logger = require('./logger');
const { pgclientSetup } = require('./setup');
const replicateIncrementally = require('./replicate-incrementally');
const notificationJob = require('./notification-job');
const learningContent = require('./replicate-learning-content');
const { configuration, jobOptions, repeatableJobOptions, getTablesWithReplicationModes, REPLICATION_MODE } = require('./config');

const replicationQueue = _createQueue('Replication queue');
const learningContentReplicationQueue = _createQueue('Learning Content replication queue');
const incrementalReplicationQueue = _createQueue('Incremental replication queue');
const notificationQueue = _createQueue('Notification queue');

main()
  .catch(async (error) => {
    Sentry.captureException(error);
    logger.error(error);
    await _flushSentryAndExit();
  });

async function main() {
  initSentry(configuration);
  await pgclientSetup(configuration);

  replicationQueue.process(async function() {
    await steps.fullReplicationAndEnrichment(configuration);
    incrementalReplicationQueue.add({}, jobOptions);
  });

  incrementalReplicationQueue.process(async function() {
    if (hasIncremental(configuration)) {
      await replicateIncrementally.run(configuration);
    }
    learningContentReplicationQueue.add({}, jobOptions);
  });

  learningContentReplicationQueue.process(async function() {
    logger.info('learningContent.fetchAndSaveData - Started');
    await learningContent.fetchAndSaveData(configuration);
    logger.info('learningContent.fetchAndSaveData - Ended');
    notificationQueue.add({}, { ...jobOptions, attempts: 1 });
  });

  notificationQueue.process(async function() {
    await notificationJob.run(configuration);
    logger.info('Import and enrichment done');
  });

  replicationQueue.add({}, repeatableJobOptions);

  await _setInterruptedJobsAsFailed();
}

async function _setInterruptedJobsAsFailed() {
  const promises = [replicationQueue, learningContentReplicationQueue, incrementalReplicationQueue, notificationQueue].map(async (queue) => {
    const activeJobs = await queue.getActive();

    for (const job of activeJobs) {
      await job.moveToFailed({ message: 'Move interrupted job in failed queue' }, true);
    }

    if (activeJobs.length === 0) {
      logger.info(`No active jobs to be marked as failed for queue ${queue.name}`);
    }

  });
  return Promise.all(promises);
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

function hasIncremental(configuration) {
  const incrementalTables = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL]);
  return incrementalTables.length > 0;
}

async function _flushSentryAndExit() {
  const TIMEOUT = 2000;
  await Sentry.close(TIMEOUT);
  process.exit(1);
}
