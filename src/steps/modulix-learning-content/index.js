import * as modulixLcmsClient from './lcms-client.js';
import * as databaseHelper from '../../database-helper.js';
import { NoLearningContentError } from '../../errors.js';
import { logger } from '../../logger.js';

const table = {
  name: 'modules',
  fields: [
    { name: 'uuid', type: 'text', extractor: (record) => record['id'] },
    { name: 'shortId', type: 'text' },
    { name: 'slug', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'filename', type: 'text' },
    { name: 'level', type: 'text' },
    { name: 'duration', type: 'varchar(10)' },
    { name: 'objectives', type: 'text' },
    { name: 'isBeta', type: 'bool' },
    { name: 'visibility', type: 'text' },
  ],
  indexes: [],
};

async function run(
  configuration,
  dependencies = { databaseHelper: databaseHelper, modulixLcmsClient: modulixLcmsClient },
) {
  logger.info(`Modulix replication : tables ${table.name}`);
  const modules = await dependencies.modulixLcmsClient.getLearningContent();

  if (modules) {
    await dependencies.databaseHelper.dropTable(table.name, configuration);
    await dependencies.databaseHelper.createTable(table, configuration);
    await dependencies.databaseHelper.saveLearningContent(table, modules, configuration);
  } else {
    throw new NoLearningContentError();
  }
}
export { run };
