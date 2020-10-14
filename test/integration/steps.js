const { expect } = require('chai');
const execa = require('execa');
const tmp = require('tmp-promise');
const steps = require('../../steps');

const TEST_POSTGRES_URL = process.env.TEST_POSTGRES_URL || 'postgres://postgres@localhost';
const TEST_DB_NAME = 'pix_replication_test';
const TEST_DB_URL = `${TEST_POSTGRES_URL}/${TEST_DB_NAME}`;
const TEST_TABLE_NAME = 'test_table';
const TEST_TABLE_ROWS = 100000;

async function createDb() {
  await execa('psql', [ TEST_POSTGRES_URL,
    '-c', `DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`,
    '-c', `CREATE DATABASE "${TEST_DB_NAME}"`,
  ]);
}

async function runSql(...sqls) {
  const { stdout } = await execa('psql', [
    TEST_DB_URL, '--tuples-only', '--no-align',
    ...sqls.map((sql) => `--command=${sql}`)
  ]);
  return stdout;
}

async function createTables() {
  await runSql(
    `CREATE TABLE ${TEST_TABLE_NAME}(id int NOT NULL PRIMARY KEY)`,
    `COMMENT ON TABLE ${TEST_TABLE_NAME} IS 'test comment'`
  );
}

async function createTablesThatMayNotBeRestored() {
  await runSql('CREATE TABLE answers (id int NOT NULL PRIMARY KEY)');
  await runSql('CREATE TABLE "knowledge-elements" (id int NOT NULL PRIMARY KEY, "userId" INTEGER)');
  await runSql('CREATE INDEX "knowledge_elements_userid_index" ON "knowledge-elements" ("userId")');
}

async function createTableWithForeignKey() {
  await runSql(`CREATE TABLE referencing (id INTEGER REFERENCES ${TEST_TABLE_NAME})`);
}

async function fillTables() {
  await runSql(
    `INSERT INTO ${TEST_TABLE_NAME}(id) SELECT x FROM generate_series(1, ${TEST_TABLE_ROWS}) s(x)`
  );
}

async function createBackup() {
  const path = await tmp.tmpName();
  await execa('pg_dump', [
    '--format=c',
    `--file=${path}`,
    TEST_DB_URL,
  ], { stdio: 'inherit' });
  return path;
}

describe('restoreBackup', function() {
  let backupFile;

  context('whatever options are provided', ()=> {

    before(async function() {
      process.env.DATABASE_URL = TEST_DB_URL;
      await createDb();
      await createTables();
      await fillTables();
      backupFile = await createBackup();
    });

    before(async function() {
      process.env.DATABASE_URL = TEST_DB_URL;
      await createDb();
      await steps.restoreBackup({ backupFile });
    });

    it('restores the data', async function() {
      const restoredRowCount = parseInt(await runSql(`SELECT COUNT(*) FROM ${TEST_TABLE_NAME}`));
      expect(restoredRowCount).to.equal(TEST_TABLE_ROWS);
    });

    it('does not restore comments', async function() {
      const restoredComment = await runSql(`SELECT obj_description('${TEST_TABLE_NAME}'::regclass, 'pg_class')`);
      expect(restoredComment).to.be.empty;
    });

  });

  context('according to environment variables', ()=>{

    context('when some table restoration is disabled', ()=> {

      before(async function() {
        process.env.DATABASE_URL = TEST_DB_URL;
        await createDb();
        await createTables();
        await fillTables();
        await createTablesThatMayNotBeRestored();
        backupFile = await createBackup();
      });

      before(async function() {
        process.env.DATABASE_URL = TEST_DB_URL;
        await createDb();
        await steps.restoreBackup({ backupFile });
      });

      it('does not restore these tables', async function() {

        const isAnswersRestored = await runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'answers\'');
        expect(isAnswersRestored).to.equal('0');

        const isKnowledgeElementsRestored = await runSql('SELECT  COUNT(1) FROM information_schema.tables t WHERE t.table_name = \'knowledge-elements\'');
        expect(isKnowledgeElementsRestored).to.equal('0');
      });

    });

    context('when foreign key constraints restoration is enabled', ()=> {

      before(async function() {
        process.env.DATABASE_URL = TEST_DB_URL;
        await createDb();
        await createTables();
        await fillTables();
        await createTableWithForeignKey();
        backupFile = await createBackup();
      });

      before(async function() {
        process.env.DATABASE_URL = TEST_DB_URL;
        process.env.RESTORE_FK_CONSTRAINTS = 'true';
        await createDb();
        await steps.restoreBackup({ backupFile });
      });

      it('does restore these constraints', async function() {

        const areForeignKeysRestored = await runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\'');
        expect(areForeignKeysRestored).to.equal('1');

      });

    });

    context('when foreign key constraints restoration is disabled', ()=> {

      before(async function() {
        process.env.DATABASE_URL = TEST_DB_URL;
        await createDb();
        await createTables();
        await fillTables();
        await createTableWithForeignKey();
        backupFile = await createBackup();
      });

      before(async function() {
        process.env.DATABASE_URL = TEST_DB_URL;
        process.env.RESTORE_FK_CONSTRAINTS = 'false';
        await createDb();
        await steps.restoreBackup({ backupFile });
      });

      it('does not restore foreign keys constraints', async function() {

        const areForeignKeysRestored = await runSql('SELECT COUNT(1) FROM pg_constraint pgc  WHERE pgc.contype = \'f\'');
        expect(areForeignKeysRestored).to.equal('0');

      });

    });
  });

});
