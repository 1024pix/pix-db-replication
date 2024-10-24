import 'dotenv/config';
import * as Sentry from '@sentry/node';
import Queue from 'bull';
import { initSentry } from './sentry-init.js';
import { logger } from './logger.js';
import { pgclientSetup } from './setup.js';
import * as steps from './steps/index.js';
import { configuration, jobOptions, repeatableJobOptions } from './config/index.js';

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
  await initSentry(configuration);
  await pgclientSetup(configuration);

  replicationQueue.process(async function() {
    await steps.backupRestore(configuration);
    incrementalReplicationQueue.add({}, jobOptions);
  });

  incrementalReplicationQueue.process(async function() {
    await steps.incremental(configuration);
    learningContentReplicationQueue.add({}, jobOptions);
  });

  learningContentReplicationQueue.process(async function() {
    logger.info('learningContent.run - Started');
    await steps.learningContent(configuration);
    logger.info('learningContent.run - Ended');
    notificationQueue.add({}, { ...jobOptions, attempts: 1 });
  });

  notificationQueue.process(async function() {
    await steps.notification(configuration);
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
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
}
