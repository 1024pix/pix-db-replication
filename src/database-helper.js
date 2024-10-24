import pg from 'pg';
const { Client } = pg;
import format from 'pg-format';
import _ from 'lodash';

import { PrimaryKeyNotNullConstraintError } from './errors.js';
import * as learningContentHelper from './steps/learning-content/learning-content-helper.js';

const LCMS_CHUNK = 2000;

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
    for (const index of tableStructure.indexes) {
      const indexQuery = format('CREATE INDEX %I on %I (%I)', `${tableStructure.name}_${index}_idx`, tableStructure.name, index);
      await client.query(indexQuery);
    }
  }, configuration);
}

async function saveLearningContent(table, learningContent, configuration) {
  if (learningContent.length) {
    await runDBOperation(async (client) => {
      const fieldNames = ['id'].concat(table.fields.map((field) => field.name));
      for await (const learningContentChunk of _.chunk(learningContent, LCMS_CHUNK)) {
        const values = _computeValuesToInsert(table, learningContentChunk);
        if (_allValuesHavePrimaryKey(values)) {
          await _insertValues(table.name, fieldNames, values, client);
        }
        else {
          throw new PrimaryKeyNotNullConstraintError(table.name);
        }
      }
    }, configuration);
  }
}

function _computeValuesToInsert(table, learningContent) {
  const fieldsStructure = [{ name: 'id' }].concat(table.fields);
  return learningContent.map((learningContentItem) => fieldsStructure.map((fieldStructure) => {
    return learningContentHelper.prepareLearningContentValueBeforeInsertion(learningContentItem, fieldStructure);
  }));
}
function _allValuesHavePrimaryKey(values) {
  return !values.some(function(value) {
    const primaryKey = value[0];
    return primaryKey == null;
  });
}

function _insertValues(tableName, fieldNames, values, client) {
  const saveQuery = format('INSERT INTO %I (%I) VALUES %L', tableName, fieldNames, values);
  return client.query(saveQuery);
}

export {
  createTable,
  dropTable,
  runDBOperation,
  saveLearningContent,
};
