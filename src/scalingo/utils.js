const moment = require('moment');

function getTodayBackup(backups) {
  const today = moment();
  const found = backups.filter((backup) => {
    return today.isSame(backup.created_at, 'day') && backup.status === 'done';
  });

  if (found.length === 0) {
    throw new Error('The backup for today is not available.');
  }
  return found[0];
}

module.exports = {
  getTodayBackup,
};
