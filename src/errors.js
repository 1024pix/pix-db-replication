class PrimaryKeyNotNullConstraintError extends Error {
  constructor(tableName) {
    const message = `At least one item to insert in table ${tableName} has no primary key`;
    super(message);
  }
}

class NoLearningContentError extends Error {
  constructor({ cause } = {}) {
    const message = 'No learning content retrieved';
    super(message, { cause });
  }
}

export {
  PrimaryKeyNotNullConstraintError,
  NoLearningContentError,
};
