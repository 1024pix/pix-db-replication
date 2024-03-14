const { expect, sinon } = require('../../../test-helper');
const { filterObjectLines } = require('../../../../src/steps/backup-restore');
const proxyquire = require('proxyquire').noPreserveCache();

describe('Unit | steps | Backup restore | index.js', () => {
  describe('#filterObjectLines', ()=>{
    context('using default configuration', async () => {
      it('should only remove comments and FK from file', async () => {
      // given
        objectLines = [
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

    it('should only filter specified table', async () => {
      // given
      configuration = {
        RESTORE_FK_CONSTRAINTS: 'false',
        BACKUP_MODE: { 'element-answers': 'incremental' },
      };

      objectLines = [
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

    it('should keep fk constraints', async () => {
      // given
      configuration = {
        RESTORE_FK_CONSTRAINTS: 'true',
        BACKUP_MODE: {},
      };
      objectLines = [
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
      const backupFilename = await createBackup(configuration);

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
        await createBackup(configuration);

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

    context('when answers, knowledge elements and knowledge element snapshots are not restored', () => {
      it('should not backup answers, knowledge-elements and knowledge-element-snapshots tables', async () => {
        // given
        const configuration = {
          SOURCE_DATABASE_URL: 'postgresql://source.url',
          BACKUP_MODE: { 'knowledge-elements': 'none', 'knowledge-element-snapshots': 'none', 'answers': 'none' },
        };

        // when
        await createBackup(configuration);

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
