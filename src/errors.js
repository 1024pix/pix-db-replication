class PrimaryKeyNotNullConstraintError extends Error {
  constructor(tableName) {
    const message = `At least one item to insert in table ${tableName} has no property at all`;
    super(message);
  }
}

export {
  PrimaryKeyNotNullConstraintError,
};
