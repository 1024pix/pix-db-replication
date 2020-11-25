const { expect } = require('chai');
const moment = require('moment');

const { retryFunction, _getBackupIdForDate } = require('../../steps');

function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
      return 'should have thrown an error';
    } catch (err) {
      return err;
    }
  };
}

describe('Unit | steps.js', () => {

  describe('#retryFunction', () => {

    it('should throw error if all retries fail', async function() {
      // given
      this.timeout(5000);
      const failedInputFunction = async () => {
        return Promise.reject(new Error());
      };

      // when
      const error = await catchErr(retryFunction)(failedInputFunction, 1);

      // then
      expect(error).to.be.instanceOf(Error);
    });
  });

  describe('#_getBackupIdForYesterday', () => {

    it('should return backup from yesterday when done', async function() {
      // given
      const nov25 = '2020-11-25T08:56:16.553Z';
      const backups = `| today-but-not-done | Mon, 25 Nov 2020 01:00:00 CET | 25 GB  | WIP   |
| backup-from-incorrect-day | Mon, 24 Nov 2020 01:00:00 CET | 25 GB  | done   |
| correct-backupId | Mon, 25 Nov 2020 01:00:00 CET | 25 GB  | done   |`;
      const date = moment(nov25).format('D MMM Y');

      // when
      const result = _getBackupIdForDate(backups, date);

      // then
      expect(result).to.deep.equal({ 'backupId': 'correct-backupId' });
    });

    it('should throw an error when backup is not ready or available', async function() {
      // given
      const dateWithoutBackup = '2020-11-27T08:56:16.553Z';
      const backups = `| today-but-not-done | Mon, 25 Nov 2020 01:00:00 CET | 25 GB  | WIP   |
| backup-from-incorrect-day | Mon, 24 Nov 2020 01:00:00 CET | 25 GB  | done   |
| correct-backupId | Mon, 25 Nov 2020 01:00:00 CET | 25 GB  | done   |`;
      const date = moment(dateWithoutBackup).format('D MMM Y');

      // when
      const error = await catchErr(_getBackupIdForDate)(backups, date);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('The backup for yesterday is not available');
    });
  });

});
