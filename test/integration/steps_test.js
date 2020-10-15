const { expect } = require('chai');

const { createFillBackupAndRestoreDatabase, runSql, TEST_TABLE_NAME, TEST_TABLE_ROWS } = require('./test-helper');

describe('Integration | steps.js', () => {

  describe('restoreBackup', function() {

    context('whatever options are provided', ()=> {

      before(async function() {
      // when
        await createFillBackupAndRestoreDatabase({});
      });

      it('restores the data', async function() {
      // then
        const restoredRowCount = parseInt(await runSql(`SELECT COUNT(*) FROM ${TEST_TABLE_NAME}`));
        expect(restoredRowCount).to.equal(TEST_TABLE_ROWS);
      });

      it('does not restore comments', async function() {
      // then
        const restoredComment = await runSql(`SELECT obj_description('${TEST_TABLE_NAME}'::regclass, 'pg_class')`);
        expect(restoredComment).to.be.empty;
      });

    });

    context('according to environment variables', ()=>{

      context('when some table restoration is disabled', ()=> {

        before(async function() {
          // given
          process.env.RESTORE_ANSWERS_AND_KES = undefined

          // when
          await createFillBackupAndRestoreDatabase({ createTablesNotToBeImported : true });
        });

        it('does not restore these tables', async function() {
        // then
          const isAnswersRestored = parseInt(await runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\''));
          expect(isAnswersRestored).to.equal(0);

          // then
          const isKnowledgeElementsRestored = parseInt(await runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\''));
          expect(isKnowledgeElementsRestored).to.equal(0);
        });

      });

      context('when foreign key constraints restoration is enabled', ()=> {

        before(async function() {
          // given
          process.env.RESTORE_FK_CONSTRAINTS = 'true';
          // when
          await createFillBackupAndRestoreDatabase({ createForeignKeys : true });
        });

        it('does restore these constraints', async function() {
        // then
          const areForeignKeysRestored = parseInt(await runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
          expect(areForeignKeysRestored).to.equal(1);
        });

      });

      context('when foreign key constraints restoration is disabled', ()=> {

        before(async function() {
        // given
          process.env.RESTORE_FK_CONSTRAINTS = 'false';
          // when
          await createFillBackupAndRestoreDatabase({ createForeignKeys : true });
        });

        it('does not restore foreign keys constraints', async function() {
        // then
          const areForeignKeysRestored = parseInt(await runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\''));
          expect(areForeignKeysRestored).to.equal(0);
        });

      });

    });

  });

});
