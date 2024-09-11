import { expect, sinon } from '../../../test-helper.js';
import { filterObjectLines } from '../../../../src/steps/backup-restore/index.js';

describe('Unit | steps | Backup restore | index.js', function() {
  describe('#filterObjectLines', function() {
    context('using default configuration', function() {
      it('should only remove FK from file', function() {
      // given
        const objectLines = [
          '4688; 0 0 COMMENT - EXTENSION pgcrypto',
          '2; 3079 38970 EXTENSION - pgcrypto',
          '4344; 2606 38649 FK CONSTRAINT public account-recovery-demands account-recovery-demands_organizationlearnerid_foreign postgres',
          '4344; 2606 38649 FK CONSTRAINT public account-recovery-demands account-recovery-demands_organizationlearnerid_foreign postgres',
          '4344; 2606 38649 SEQUENCE SET public answers postgres',
          '4344; 2606 38649 SEQUENCE SET public element-answers postgres',
          '4344; 2606 38649 SEQUENCE SET public answers-corrected postgres',
          '4344; 2606 38649 TABLE public answers postgres',
          '4344; 2606 38649 TABLE public element-answers postgres',
          '4344; 2606 38649 TABLE public assessment-results postgres',
          '3264; 1259 16832 INDEX element_answers_id_index postgres',
          '3264; 1259 16832 INDEX answers_id_index postgres',
        ];
        // when
        const result = filterObjectLines(objectLines, {});

        // then
        expect(result).to.deep.equal([
          '4688; 0 0 COMMENT - EXTENSION pgcrypto',
          '2; 3079 38970 EXTENSION - pgcrypto',
          '4344; 2606 38649 SEQUENCE SET public answers postgres',
          '4344; 2606 38649 SEQUENCE SET public element-answers postgres',
          '4344; 2606 38649 SEQUENCE SET public answers-corrected postgres',
          '4344; 2606 38649 TABLE public answers postgres',
          '4344; 2606 38649 TABLE public element-answers postgres',
          '4344; 2606 38649 TABLE public assessment-results postgres',
          '3264; 1259 16832 INDEX element_answers_id_index postgres',
          '3264; 1259 16832 INDEX answers_id_index postgres',
        ]);
      });
    });

    it('should only filter specified table', function() {
      // given
      const configuration = {
        RESTORE_FK_CONSTRAINTS: 'false',
        BACKUP_MODE: { 'element-answers': 'incremental' },
      };

      const objectLines = [
        'SEQUENCE SET public answers postgres',
        'SEQUENCE SET public element-answers postgres',
        'SEQUENCE SET public answers-corrected postgres',
        'TABLE public answers postgres',
        'TABLE public element-answers postgres',
        'TABLE public assessment-results postgres',
        'INDEX element_answers_id_index postgres',
        'INDEX answers_id_index postgres',
      ];
      // when
      const result = filterObjectLines(objectLines, configuration);

      // then
      expect(result).to.deep.equal([
        'SEQUENCE SET public answers postgres',
        'SEQUENCE SET public answers-corrected postgres',
        'TABLE public answers postgres',
        'TABLE public assessment-results postgres',
        'INDEX answers_id_index postgres',
      ]);
    });

    it('should keep fk constraints', function() {
      // given
      const configuration = {
        RESTORE_FK_CONSTRAINTS: 'true',
        BACKUP_MODE: {},
      };
      const objectLines = [
        '4344; 2606 38649 INDEX public users_email_lower postgres',
        '4344; 2606 38649 FK CONSTRAINT public account-recovery-demands account-recovery-demands_organizationlearnerid_foreign postgres',
        '4344; 2606 38649 FK CONSTRAINT public account-recovery-demands account_recovery_demands_userid_foreign postgres',
        '4344; 2606 38649 FK CONSTRAINT public activities activities_assessmentid_foreign postgres',
      ];
      // when
      const result = filterObjectLines(objectLines, configuration);

      // then
      expect(result).to.deep.equal(objectLines);
    });
  });

  describe('#createBackup', function() {
    let execStub;

    beforeEach(function() {
      execStub = sinon.stub();
    });

    it('should use pg_dump to create a full backup', async function() {
      // given
      const configuration = {
        SOURCE_DATABASE_URL: 'postgresql://source.url',
        BACKUP_MODE: {},
      };
      const backUpRestore = await import('../../../../src/steps/backup-restore/index.js');

      // when
      const backupFilename = await backUpRestore.createBackup(configuration, { exec: execStub });

      // then
      expect(execStub).to.have.been.calledWith(
        'pg_dump',
        [
          '--format', 'c',
          '--dbname', 'postgresql://source.url',
          '--no-owner',
          '--no-privileges',
          '--exclude-schema',
          'information_schema',
          '--exclude-schema', '\'^pg_*\'',
          '--file', './dump.pgsql',
        ],
      );
      expect(backupFilename).to.equal('./dump.pgsql');
    });

    context('when answers, knowledge elements and knowledge element snapshots are restored incrementally', function() {
      it('should not backup answers, knowledge-elements and knowledge-element-snapshots tables', async function() {
        // given
        const configuration = {
          SOURCE_DATABASE_URL: 'postgresql://source.url',
          BACKUP_MODE: { 'knowledge-elements': 'incremental', 'knowledge-element-snapshots': 'incremental', 'answers': 'incremental' },
        };
        const backUpRestore = await import('../../../../src/steps/backup-restore/index.js');

        // when
        await backUpRestore.createBackup(configuration, { exec: execStub });

        // then
        expect(execStub).to.have.been.calledWith(
          'pg_dump',
          [
            '--format', 'c',
            '--dbname', 'postgresql://source.url',
            '--no-owner',
            '--no-privileges',
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

    context('when answers, knowledge elements and knowledge element snapshots are not restored', function() {
      it('should not backup answers, knowledge-elements and knowledge-element-snapshots tables', async function() {
        // given
        const configuration = {
          SOURCE_DATABASE_URL: 'postgresql://source.url',
          BACKUP_MODE: { 'knowledge-elements': 'none', 'knowledge-element-snapshots': 'none', 'answers': 'none' },
        };
        const backUpRestore = await import('../../../../src/steps/backup-restore/index.js');

        // when
        await backUpRestore.createBackup(configuration, { exec: execStub });

        // then
        expect(execStub).to.have.been.calledWith(
          'pg_dump',
          [
            '--format', 'c',
            '--dbname', 'postgresql://source.url',
            '--no-owner',
            '--no-privileges',
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
