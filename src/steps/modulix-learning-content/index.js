import * as modulixLcmsClient from './lcms-client.js';
import * as databaseHelper from '../../database-helper.js';
import { NoLearningContentError } from '../../errors.js';
import { logger } from '../../logger.js';

const table = {
  name: 'modules',
  fields: [
    { name: 'uuid', type: 'text', extractor: (record) => record['id'] },
    { name: 'slug', type: 'text' },
    { name: 'title', type: 'text' },
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
