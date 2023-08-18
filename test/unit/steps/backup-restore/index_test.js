const { expect, sinon } = require('../../../test-helper');
const proxyquire = require('proxyquire').noPreserveCache();
const { getTablesWithReplicationModes, REPLICATION_MODE } = require('../../../../src/config');

describe('Unit | steps | Backup restore | index.js', () => {

  describe('#createBackup', () => {
    let execStub;
    let createBackup;

    beforeEach(() => {
      execStub = sinon.stub();
      const newIndex = proxyquire('../../../../src/steps/backup-restore', {
        '../../exec': {
          exec: execStub,
        },
      });
      createBackup = newIndex.createBackup;
    });

    it('should use pg_dump to create a full backup', async () => {
      // given
      const configuration = {
        SOURCE_DATABASE_URL: 'postgresql://source.url',
        BACKUP_MODE: {},
      };

      // when
      const backupFilename = await createBackup({ configuration, tablesToExcludeFromBackup: [] });

      // then
      expect(execStub).to.have.been.calledWith(
        'pg_dump',
        [
          '--clean',
          '--if-exists',
          '--format', 'c',
          '--dbname', 'postgresql://source.url',
          '--no-owner',
          '--no-privileges',
          '--no-comments',
          '--exclude-schema',
          'information_schema',
          '--exclude-schema', '\'^pg_*\'',
          '--file', './dump.pgsql',
        ],
      );
      expect(backupFilename).to.equal('./dump.pgsql');
    });

    context('when answers, knowledge elements and knowledge element snapshots are restored incrementally', () => {
      it('should not backup answers, knowledge-elements and knowledge-element-snapshots tables', async () => {
        // given
        const configuration = {
          SOURCE_DATABASE_URL: 'postgresql://source.url',
          BACKUP_MODE: { 'knowledge-elements': 'incremental', 'knowledge-element-snapshots': 'incremental', 'answers': 'incremental' },
        };

        // when
        const tablesToExcludeFromBackup = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL, REPLICATION_MODE.TO_EXCLUDE]);

        await createBackup({ configuration, tablesToExcludeFromBackup });

        // then
        expect(execStub).to.have.been.calledOnceWith(
          'pg_dump',
          [
            '--clean',
            '--if-exists',
            '--format', 'c',
            '--dbname', 'postgresql://source.url',
            '--no-owner',
            '--no-privileges',
            '--no-comments',
            '--exclude-schema',
            'information_schema',
            '--exclude-schema', '\'^pg_*\'',
            '--file', './dump.pgsql',
            '--exclude-table', 'knowledge-elements',
            '--exclude-table', 'knowledge-element-snapshots',
            '--exclude-table', 'answers',
          ],
        );

      });
    });

    context('when answers, knowledge elements and knowledge element snapshots are not restored', () => {
      it('should not backup answers, knowledge-elements and knowledge-element-snapshots tables', async () => {
        // given
        const configuration = {
          SOURCE_DATABASE_URL: 'postgresql://source.url',
          BACKUP_MODE: { 'knowledge-elements': 'none', 'knowledge-element-snapshots': 'none', 'answers': 'none' },
        };

        // when
        const tablesToExcludeFromBackup = getTablesWithReplicationModes(configuration, [REPLICATION_MODE.INCREMENTAL, REPLICATION_MODE.TO_EXCLUDE]);

        await createBackup({ configuration, tablesToExcludeFromBackup });

        // then
        expect(execStub).to.have.been.calledWith(
          'pg_dump',
          [
            '--clean',
            '--if-exists',
            '--format', 'c',
            '--dbname', 'postgresql://source.url',
            '--no-owner',
            '--no-privileges',
            '--no-comments',
            '--exclude-schema',
            'information_schema',
            '--exclude-schema', '\'^pg_*\'',
            '--file', './dump.pgsql',
            '--exclude-table', 'knowledge-elements',
            '--exclude-table', 'knowledge-element-snapshots',
            '--exclude-table', 'answers',
          ],
        );

      });
    });

  });

});
