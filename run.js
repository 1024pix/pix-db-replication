require('dotenv').config();
const steps = require('./steps');

steps.restoreLatestBackup()
.then(() => {
  process.exit(0);
})
.catch((error) => {
  console.error(error);
  process.exit(1);
});