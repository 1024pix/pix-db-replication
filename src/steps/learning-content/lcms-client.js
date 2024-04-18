import axios from 'axios';
import { logger } from '../../logger.js';

const timeout = 60 * 1000 * 3;

async function getLearningContent(configuration) {
  const url = configuration.LCMS_API_URL + '/databases/airtable';
  // eslint-disable-next-line n/no-process-env
  const application = process.env.APP || 'pix-db-replication';
  const headers = {
    'Authorization': `Bearer ${configuration.LCMS_API_KEY}`,
    'client': application,
  };
  const requestConfig = {
    headers,
    signal: AbortSignal.timeout(configuration.timeout || timeout),
  };

  try {
    const response = await axios.get(url, requestConfig);
    return response.data;
  } catch (httpErr) {
    logger.error(`Error on GET request to ${url}`);
    throw httpErr;
  }
}

export {
  getLearningContent,
};
