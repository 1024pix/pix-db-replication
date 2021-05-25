require('dotenv').config();
const Queue = require('bull');
const Sentry = require('@sentry/node');
const logger = require('./logger');
const extractConfigurationFromEnvironment = require('./extract-configuration-from-environment');

const configuration = extractConfigurationFromEnvironment();

const testQueue = _createQueue('Test queue');

async function main() {
  testQueue.process(async function() {
    logger.info('Test queue is processing a job');
    return new Promise((res) =>
      setTimeout(function() {
        logger.info('Test queue finished processing job');
        res('Time is out!');
      }, 1000 * 30)
    );
  });

  const testJobOptions = {
    repeat: { cron: '*/1 * * * *' },
    jobId: 'Job A',
    removeOnCompleted: true,
    attempts: configuration.MAX_RETRY_COUNT,
    backoff: { type: 'exponential', delay: 100 }
  };

  testQueue.add({}, testJobOptions);

  const activeJobs = await testQueue.getActive();
  logger.info(`Active jobs count: ${activeJobs.length}`);

  const waitingJobs = await testQueue.getWaiting();
  logger.info(`Waiting jobs count: ${waitingJobs.length}`);
}

main()
  .catch(async (error) => {
    Sentry.captureException(error);
    logger.error(error);
    process.exit(1);
  });

async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}.`);
  process.exit(1);
}

process.on('uncaughtException', () => {
  exitOnSignal('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled Rejection at:', promise, 'reason:', reason);
  exitOnSignal('unhandledRejection');
});
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitOnSignal('SIGINT');
});

async function _handleActiveJobs() {
  const activeJobs = await testQueue.getActive();
  logger.info(`Active jobs count: ${activeJobs.length}`);
  for (const job of activeJobs) {
    await job.moveToFailed({ message: 'Container stopped while job is active.' }, true);
  }
}

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
