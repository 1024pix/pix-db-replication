const { run: backupRestore } = require('./backup-restore');
const { run: incremental } = require('./incremental');
const { run: learningContent } = require('./learning-content');
const { run: notification } = require('./notification');
const { run: dumpAndPushS3 } = require('./dump-and-push-on-S3');

module.exports = {
  backupRestore,
  incremental,
  learningContent,
  notification,
  dumpAndPushS3,
};
