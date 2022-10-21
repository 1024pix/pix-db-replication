const config = require('../src/config/extract-configuration-from-environment')();
const steps = require('../src/steps');

(async ()=>{
  await steps.importLearningContent(config);
})();
