const _ = require('lodash');
const lcmsClient = require('./lcms-client');
const databaseHelper = require('./database-helper');

const tables = [{
  name: 'areas',
  fields: [
    { name: 'name', type: 'text' },
  ],
  indexes: [],
}, {
  name: 'attachments',
  fields: [
    { name: 'type', type: 'text' },
    { name: 'challengeId', type: 'text' },
    { name: 'alt', type: 'text' },
    { name: 'url', type: 'text' },
    { name: 'size', type: 'numeric' },
  ],
  indexes: [],
}, {
  name: 'competences',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'code', type: 'text', extractor: (record) => record['index'] },
    { name: 'title', type: 'text', extractor: (record) => record['nameFrFr'] },
    { name: 'origin', type: 'text' },
    { name: 'areaId', type: 'text', isArray: false },
  ],
  indexes: ['areaId'],
}, {
  name: 'tubes',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'competenceId', type: 'text', isArray: false },
  ],
  indexes: ['competenceId'],
}, {
  name: 'skills',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'level', type: 'smallint' },
    { name: 'tubeId', type: 'text', isArray: false },
    { name: 'status', type: 'text' },
    { name: 'pixValue', type: 'numeric(6,5)' },
    { name: 'hintStatus', type: 'text' },
    { name: 'tutorialIds', type: 'text []', isArray: true },
    { name: 'learningMoreTutorialIds', type: 'text []', isArray: true },
    { name: 'internationalisation', type: 'text' },
  ],
  indexes: ['tubeId'],
}, {
  name: 'challenges',
  fields: [
    { name: 'instruction', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'type', type: 'text' },
    { name: 'timer', type: 'smallint' },
    { name: 'autoReply', type: 'boolean' },
    { name: 'skillId', type: 'text', isArray: false },
    { name: 'skillIds', type: 'text []', isArray: true, extractor: (record) => [record['skillId']] },
    { name: 'skillCount', type: 'smallint', extractor: (_) => 1 },
    { name: 'firstSkillId', type: 'text', extractor: (record) => record['skillId'] },
    { name: 'secondSkillId', type: 'text', extractor: (_) => undefined },
    { name: 'thirdSkillId', type: 'text', extractor: (_) => undefined },
    { name: 'languages', type: 'text []', isArray: true, extractor: (record) => record['locales'] },
    { name: 'embedUrl', type: 'text' },
    { name: 'hasEmbedUrl', type: 'boolean', extractor: (record) => !!record['embedUrl'] },
    { name: 'alternativeInstruction', type: 'text' },
    { name: 'hasAlternativeInstruction', type: 'boolean', extractor: (record) => !!record['alternativeInstruction'] },
    { name: 'area', type: 'text' },
    { name: 'focus', type: 'boolean', extractor: (record) => !!record['focusable'] },
    { name: 'explicativeResponse', type: 'text', extractor: (record) => record['solutionToDisplay'] },
    { name: 'delta', type: 'numeric' },
    { name: 'alpha', type: 'numeric' },
  ],
  indexes: ['firstSkillId'],
}, {
  name: 'courses',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'adaptive', type: 'boolean' },
    { name: 'competences', type: 'text[]', isArray: true },
    { name: 'competenceId', type: 'text', extractor: (record) => _.get(record['competences'], 0) },
  ],
  indexes: ['competenceId'],
}, {
  name: 'tutorials',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'link', type: 'text' },
    { name: 'tutorialForSkills', type: 'text []', isArray: true },
    { name: 'furtherInformation', type: 'text []', isArray: true },
    { name: 'locale', type: 'text' },
  ],
  indexes: ['title'],
}];

async function fetchAndSaveData(configuration) {
  const learningContent = await lcmsClient.getLearningContent(configuration);
  if (learningContent) {
    await Promise.all(tables.map(async (table) => {
      await databaseHelper.dropTable(table.name, configuration);
      await databaseHelper.createTable(table, configuration);
      await databaseHelper.saveLearningContent(table, learningContent[table.name], configuration);
    }));
  }
}

module.exports = {
  fetchAndSaveData,
};
