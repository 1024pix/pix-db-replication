async function createBackupAndCreateEmptyDatabase(database, { createTablesNotToBeImported = false, createForeignKeys = false }) {
  await database.createAndFillDatabase({ createTablesNotToBeImported, createForeignKeys });
  const backupFile = await database.createBackup();
  await database.dropDatabase();
  await database.createDatabase();
  return backupFile;
}

module.exports = { createBackupAndCreateEmptyDatabase };
