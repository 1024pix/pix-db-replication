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
  await runSql('CREATE TABLE answers (id int NOT NULL PRIMARY KEY, "challengeId" CHARACTER VARYING(255) )');
  await runSql('CREATE TABLE "knowledge-elements" (id int NOT NULL PRIMARY KEY, "userId" INTEGER, "createdAt" TIMESTAMP WITH TIME ZONE)');
  await runSql('CREATE INDEX "knowledge_elements_userid_index" ON "knowledge-elements" ("userId")');
}

async function createTableWithForeignKey() {
  await runSql(`CREATE TABLE referencing (id INTEGER REFERENCES ${TEST_TABLE_NAME})`);
}

async function createTableToBeIndexed() {
  await runSql('CREATE TABLE users (id INT NOT NULL PRIMARY KEY, "createdAt" TIMESTAMP WITH TIME ZONE)');
}

async function createTableToBeBaseForView() {
  await runSql('CREATE TABLE "schooling-registrations" (id INT NOT NULL PRIMARY KEY)');
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

async function createFillBackupAndRestoreDatabase({ createTablesNotToBeImported = false, createForeignKeys = false }) {
  process.env.DATABASE_URL = TEST_DB_URL;
  await createAndFillDatabase({ createTablesNotToBeImported, createForeignKeys });
  const backupFile = await createBackup();
  await createDb();
  await steps.restoreBackup({ backupFile });
}

async function createAndFillDatabase({ createTablesNotToBeImported = false, createForeignKeys = false }) {
  await createDb();
  await createTables();
  await fillTables();
  await createTableToBeIndexed();
  await createTableToBeBaseForView();

  if (createTablesNotToBeImported) {
    await createTablesThatMayNotBeRestored();
  }
  if (createForeignKeys) {
    await createTableWithForeignKey();
  }
}

module.exports = { createFillBackupAndRestoreDatabase, runSql, TEST_TABLE_NAME, TEST_TABLE_ROWS  };
