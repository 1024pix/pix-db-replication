const axios = require('axios');
const logger = require('./logger');

const timeout = 60 * 1000 * 3;

async function getLearningContent(configuration) {
  const url = configuration.LCMS_API_URL + '/databases/airtable';
  const requestConfig = {
    headers: { 'Authorization': `Bearer ${configuration.LCMS_API_KEY}` },
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

module.exports = {
  getLearningContent,
};
