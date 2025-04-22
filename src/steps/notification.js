'use strict';

import axios from 'axios';
import { logger } from '../logger.js';

async function run(configuration) {
  logger.info('Start notification');

  for (const notification of configuration.NOTIFICATIONS) {
    logger.info(`Notify ${notification.url}`);
    await notifyUrl(notification);
  }

  logger.info('Notification done');
}

async function notifyUrl(notification) {
  try {
    const headers = {};
    if (notification.token !== undefined) {
      headers.Authorization = notification.token;
    } else if (notification.username !== undefined && notification.password !== undefined) {
      headers.Authorization = `Basic ${btoa(`${notification.username}:${notification.password}`)}`;
    }

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
