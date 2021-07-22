const lcms = require('./lcms');

async function fetchAndSaveData(configuration) {
  return lcms.getLearningContent(configuration);
}

module.exports = {
  fetchAndSaveData,
};
