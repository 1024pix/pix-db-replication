const sinon = require('sinon');
const { expect } = require('chai');

const { getTodayBackup } = require('../../../src/scalingo/utils');

describe('Scalingo utils', () => {
  describe('getTodayBackup', () => {
    beforeEach(async () => {
      sinon.useFakeTimers(new Date(2020, 10, 10));
    });

    afterEach(async () => {
      sinon.restore();
    });

    it('should return the todays backup for the given addon', async () => {
      // given
      const backups = [
        {
          id: 'backup1',
          created_at: '2020-11-10T23:00:00.473+01:00',
          started_at: '2020-11-10T23:01:09.834+01:00',
          status: 'done',
        },
      ];
      // when
      const result = getTodayBackup(backups);
      // then
      expect(result.id).to.be.deep.equal('backup1');
    });

    it('should throw an error if backup for today not found', async () => {
      // given
      const backups = [
        {
          id: 'backup1',
          created_at: '2020-11-09T23:00:00.473+01:00',
          started_at: '2020-11-09T23:01:09.834+01:00',
          status: 'done',
        },
      ];
      // when
      try {
        getTodayBackup(backups);
        expect.fail('should raise an error when backup for today not found');
      } catch (e) {
        expect(e.message).to.equal('The backup for today is not available.');
      }
    });

    it('should throw an error if backup for today is not finished', async () => {
      // given
      const backups = [
        {
          id: 'backup1',
          created_at: '2020-11-10T23:00:00.473+01:00',
          started_at: '2020-11-10T23:01:09.834+01:00',
          status: 'pending',
        },
      ];
      // when
      try {
        getTodayBackup(backups);
        expect.fail('should raise an error when backup for today not found');
      } catch (e) {
        expect(e.message).to.equal('The backup for today is not available.');
      }
    });
  });
});
