import { configuration, jobOptions } from '../src/config/index.js';
import Queue from 'bull';

async function main() {
  const QUEUE_NAME = process.argv[2];
  const queue = new Queue(QUEUE_NAME, configuration.REDIS_URL);
  await queue.add({}, jobOptions);

  // eslint-disable-next-line n/no-process-exit
  process.exit(0);
}

main();
