async function createBackupAndCreateEmptyDatabase(database, databaseConfig, { createTablesNotToBeImported = false, createForeignKeys = false }) {
  await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported, createForeignKeys });
  const backupFile = await database.createBackup();
  await database.dropDatabase();
  await database.createDatabase();
  return backupFile;
}

async function createBackup(database, databaseConfig, {
  createTablesNotToBeImported = false,
  createForeignKeys = false,
  createFunction = false,
  dropDatabase = true
}) {
  await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported, createForeignKeys, createFunction });
  const backupFile = await database.createBackup();
  if (dropDatabase) {
    await database.dropDatabase();
  }
  return backupFile;
}

async function createAndFillDatabase(database, databaseConfig, {
  createTablesNotToBeImported = false,
  createForeignKeys = false,
  createFunction = false
}) {
  await createTables(database, databaseConfig);
  await fillTables(database, databaseConfig);
  await createTableToBeIndexed(database);
  await createTableToBeBaseForView(database);

  if (createTablesNotToBeImported) {
    await createTablesThatMayNotBeRestored(database);
  }
  if (createForeignKeys) {
    await createTableWithForeignKey(database, databaseConfig);
  }
  if (createFunction) {
    await createTestFunction(database);
  }
}

async function createTableToBeBaseForView(database) {
  await database.runSql('CREATE TABLE "schooling-registrations" (id INT NOT NULL PRIMARY KEY)');
}

async function createTablesThatMayNotBeRestored(database) {
  await database.runSql('CREATE TABLE answers (id int NOT NULL PRIMARY KEY, "challengeId" CHARACTER VARYING(255) )');
  await database.runSql('INSERT INTO answers (id, "challengeId") VALUES (1,2)');
  await database.runSql('CREATE TABLE "knowledge-elements" (id int NOT NULL PRIMARY KEY, "userId" INTEGER, "createdAt" TIMESTAMP WITH TIME ZONE)');
  await database.runSql('CREATE TABLE "knowledge-element-snapshots" (id serial)');
  await database.runSql('INSERT INTO "knowledge-elements" (id, "userId", "createdAt") VALUES (1, 2, CURRENT_TIMESTAMP)');
  await database.runSql('INSERT INTO "knowledge-element-snapshots" DEFAULT VALUES');
  await database.runSql('CREATE INDEX "knowledge_elements_userid_index" ON "knowledge-elements" ("userId")');
}

async function createTableWithForeignKey(database, databaseConfig) {
  await database.runSql(`CREATE TABLE referencing (id INTEGER REFERENCES ${databaseConfig.tableName})`);
  await database.runSql('INSERT INTO referencing (id) VALUES (1)');
  await database.runSql('INSERT INTO referencing (id) VALUES (2)');
}

async function createTableToBeIndexed(database) {
  await database.runSql('CREATE TABLE users (id INT NOT NULL PRIMARY KEY, "createdAt" TIMESTAMP WITH TIME ZONE)');
}

async function fillTables(database, databaseConfig) {
  await database.runSql(
    `INSERT INTO ${databaseConfig.tableName}(id) SELECT x FROM generate_series(1, ${databaseConfig.tableRowCount}) s(x)`
  );
}

async function createTables(database, databaseConfig) {
  await database.runSql(
    `CREATE TABLE ${databaseConfig.tableName}(id int NOT NULL PRIMARY KEY)`,
    `COMMENT ON TABLE ${databaseConfig.tableName} IS 'test comment'`
  );
}

async function createTestFunction(database) {
  await database.runSql(
    `CREATE OR REPLACE FUNCTION testFunction ()
      RETURNS integer AS $value$
      BEGIN
      RETURN 0;
      END;
      $value$ LANGUAGE plpgsql;`
  );
}

module.exports = { createBackupAndCreateEmptyDatabase, createAndFillDatabase, createBackup };
