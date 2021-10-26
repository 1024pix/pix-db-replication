class PrimaryKeyNotNullConstraintError extends Error {
  constructor(tableName) {
    const message = `No primary key found for table ${tableName}`;
    super(message);
  }
}

module.exports = {
  PrimaryKeyNotNullConstraintError,
};
