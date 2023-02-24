const axios = require('axios');
const logger = require('./logger');

async function getLearningContent(configuration) {
  const url = configuration.LCMS_API_URL + '/databases/airtable';
  const requestConfig = {
    headers: { 'Authorization': `Bearer ${configuration.LCMS_API_KEY}` },
    timeout: 60000,
  };

  try {
    const response = await axios.get(url, requestConfig);
    return response.data;
  } catch (httpErr) {
    logger.error(`Error on GET request to ${url}`);
    throw (httpErr);
  }
}

module.exports = {
  getLearningContent,
};
