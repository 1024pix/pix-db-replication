'use strict';

import axios from 'axios';
import { logger } from '../logger.js';

async function run(configuration) {
  logger.info('Start notification');

  for (const url of configuration.NOTIFICATION_URLS) {
    logger.info(`Notify ${url}`);
    await notifyUrl(url);
  }

  logger.info('Notification done');
}

async function notifyUrl(url) {
  try {
    const response = await axios.post(url);
    return response;
  } catch (httpErr) {
    logger.error(`Error on POST request to ${url}`);
    throw (httpErr);
  }
}

export {
  run,
};
