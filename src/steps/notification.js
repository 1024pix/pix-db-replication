'use strict';

import axios from 'axios';
import { logger } from '../logger.js';

async function run(configuration) {
  logger.info('Start notification');

  for (const notification of configuration.NOTIFICATION_URLS) {
    logger.info(`Notify ${notification.url}`);
    await notifyUrl(notification);
  }

  logger.info('Notification done');
}

async function notifyUrl(notification) {
  try {
    const isAuthenticated = notification.token !== undefined;
    const headers = !isAuthenticated ? {} : {
      Authorization: notification.token,
    };
    const response = await axios.post(notification.url, {}, {
      headers,
    });
    return response;
  } catch (httpErr) {
    logger.error(`Error on POST request to ${notification.url}`);
    throw (httpErr);
  }
}

export {
  run,
};
