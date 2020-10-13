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

  before(async function() {
    await createDb();
    await createTables();
    await fillTables();
    backupFile = await createBackup();
    process.env.DATABASE_URL = TEST_DB_URL;
  });

  before(async function() {
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
