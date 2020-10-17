const { expect } = require('chai');

const TEST_POSTGRES_URL = process.env.TEST_POSTGRES_URL || 'postgres://postgres@localhost';
const TEST_DB_NAME = 'pix_replication_test';
process.env.DATABASE_URL  = `${TEST_POSTGRES_URL}/${TEST_DB_NAME}`;

const { createFillBackupAndRestoreDatabase, runSql } = require('./test-helper');
const { add } = require('../../enrichment');

describe('Integration | enrichment.js', () => {

  describe('add', function() {

    context('whatever options are provided', ()=> {

      before(async function() {
        // given
        await createFillBackupAndRestoreDatabase({});

        // when
        await add();
      });

      it('create index users_createdAt_idx', async function() {
        // then
        const indexCount = parseInt(await runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'users_createdAt_idx\''));
        expect(indexCount).to.equal(1);
      });

      it('create view students', async function() {
        // then
        const viewCount = parseInt(await runSql('SELECT COUNT(1) FROM pg_views vws WHERE vws.viewname = \'students\';'));
        expect(viewCount).to.equal(1);
      });

    });

    context('according to environment variables', ()=>{

      before(async function() {
        // given
        process.env.RESTORE_ANSWERS_AND_KES = 'true';
        await createFillBackupAndRestoreDatabase({ createTablesNotToBeImported : true });

        // when
        await add();
      });

      it('does create these indexes', async function() {

        // then
        const KEIndexCount = parseInt(await runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'knowledge-elements_createdAt_idx\''));
        expect(KEIndexCount).to.equal(1);

        // then
        const answersIndexCount = parseInt(await runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'answers_challengeId_idx\''));
        expect(answersIndexCount).to.equal(1);
      });

    });

  });

});
