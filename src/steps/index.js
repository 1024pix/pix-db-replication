const { run: backupRestore } = require('./backup-restore');
const { run: incremental } = require('./incremental');
const { run: learningContent } = require('./learning-content');
const { run: notification } = require('./notification');

module.exports = {
  backupRestore,
  incremental,
  learningContent,
  notification,
};
