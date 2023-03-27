require('dotenv').config();
const Sentry = require('@sentry/node');
const Queue = require('bull');
const initSentry = require('./sentry-init');
const logger = require('./logger');
const { pgclientSetup } = require('./setup');
const backupRestore = require('./steps/backup-restore');
const incremental = require('./steps/incremental');
const notification = require('./steps/notification');
const learningContent = require('./steps/learning-content');
const { configuration, jobOptions, repeatableJobOptions } = require('./config');

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
    await backupRestore.run(configuration);
    incrementalReplicationQueue.add({}, jobOptions);
  });

  incrementalReplicationQueue.process(async function() {
    await incremental.run(configuration);
    learningContentReplicationQueue.add({}, jobOptions);
  });

  learningContentReplicationQueue.process(async function() {
    logger.info('learningContent.run - Started');
    await learningContent.run(configuration);
    logger.info('learningContent.run - Ended');
    notificationQueue.add({}, { ...jobOptions, attempts: 1 });
  });

  notificationQueue.process(async function() {
    await notification.run(configuration);
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

async function _flushSentryAndExit() {
  const TIMEOUT = 2000;
  await Sentry.close(TIMEOUT);
  process.exit(1);
}
