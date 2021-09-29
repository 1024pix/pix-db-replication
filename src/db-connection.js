const { Client } = require('pg');
const format = require('pg-format');

async function runDBOperation(callback, configuration) {
  const client = new Client({
    connectionString: configuration.DATABASE_URL,
  });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

async function dropTable(tableName, configuration) {
  return runDBOperation(async (client) => {
    const dropQuery = `DROP TABLE IF EXISTS ${format.ident(tableName)} CASCADE`;
    await client.query(dropQuery);
  }, configuration);
}

async function createTable(tableStructure, configuration) {
  await runDBOperation(async (client) => {
    const fieldsText = ['"id" text PRIMARY KEY'].concat(tableStructure.fields.map((field) => {
      return format('\t%I\t%s', field.name, field.type + (field.type === 'boolean' ? ' NOT NULL' : ''));
    })).join(',\n');
    const createQuery = format('CREATE TABLE %I (%s)', tableStructure.name, fieldsText);
    await client.query(createQuery);
    for (const index of tableStructure.indices) {
      const indexQuery = format('CREATE INDEX %I on %I (%I)', `${tableStructure.name}_${index}_idx`, tableStructure.name, index);
      await client.query(indexQuery);
    }
  }, configuration);
}

async function saveLearningContent(table, learningContent, configuration) {
  if (learningContent.length) {
    await runDBOperation(async (client) => {
      const fieldNames = ['id'].concat(table.fields.map((field) => field.name));
      const fieldsStructure = [{ name: 'id' }].concat(table.fields);
      const values = learningContent.map((learningContentItem) => fieldsStructure.map((fieldStructure) => {
        return _prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure);
      }));
      const saveQuery = format('INSERT INTO %I (%I) VALUES %L', table.name, fieldNames, values);
      await client.query(saveQuery);
    }, configuration);
  }
}

function _prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure) {
  const learningContentValue = learningContentItem[fieldStructure.name];
  const value = fieldStructure.extractor ? fieldStructure.extractor(learningContentItem) : learningContentValue;
  if (!Array.isArray(value)) {
    return value;
  }
  return fieldStructure.isArray ? `{${value.join(',')}}` : value[0];
}

module.exports = {
  createTable,
  dropTable,
  runDBOperation,
  saveLearningContent,
};
