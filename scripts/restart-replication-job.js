const { configuration, jobOptions } = require('../src/config');
const Queue = require('bull');

async function main() {
  const QUEUE_NAME = process.argv[2];
  const queue = new Queue(QUEUE_NAME, configuration.REDIS_URL);
  await queue.add({}, jobOptions);

  process.exit(0);
}

main();
