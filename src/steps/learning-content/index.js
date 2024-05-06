import * as lcmsClient from './lcms-client.js';
import * as databaseHelper from '../../database-helper.js';

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
    { name: 'name', type: 'text', extractor: (record) => record['name_i18n']['fr'] },
    { name: 'code', type: 'text', extractor: (record) => record['index'] },
    { name: 'title', type: 'text', extractor: (record) => record['name_i18n']['fr'] },
    { name: 'origin', type: 'text' },
    { name: 'areaId', type: 'text', isArray: false },
  ],
  indexes: ['areaId'],
}, {
  name: 'tubes',
  fields: [
    { name: 'name', type: 'text' },
    { name: 'practicalTitle', type: 'text', extractor: (record) => record.practicalTitle_i18n.fr },
    { name: 'practicalDescription', type: 'text', extractor: (record) => record.practicalDescription_i18n.fr },
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
    { name: 'spoil_focus', type: 'text' },
    { name: 'spoil_variabilisation', type: 'text []', isArray: true },
    { name: 'spoil_mauvaisereponse', type: 'text []', isArray: true },
    { name: 'spoil_nouvelacquis', type: 'text' },
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
    { name: 'createdAt', type: 'timestamptz' },
    { name: 'validatedAt', type: 'timestamptz' },
    { name: 'archivedAt', type: 'timestamptz' },
    { name: 'madeObsoleteAt', type: 'timestamptz' },
    { name: 'accessibility1', type: 'text' },
    { name: 'accessibility2', type: 'text' },
    { name: 'spoil', type: 'text' },
    { name: 'responsive', type: 'text' },
    { name: 'genealogy', type: 'text' },
    { name: 'version', type: 'smallint' },
    { name: 'alternativeVersion', type: 'smallint' },
    { name: 'declinable', type: 'text' },
    { name: 'proposals', type: 'text' },
    { name: 'solution', type: 'text' },
    { name: 'pedagogy', type: 'text' },
    { name: 'shuffled', type: 'boolean', extractor: (record) => !!record['shuffled'] },
    { name: 'contextualizedFields', type: 'text []', isArray: true },
    { name: 'urlsToConsult', type: 'text []', isArray: true },
  ],
  indexes: ['firstSkillId'],
}, {
  name: 'courses',
  fields: [
    { name: 'name', type: 'text' },
  ],
  indexes: [],
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

async function run(configuration, dependencies = { databaseHelper: databaseHelper, lcmsClient: lcmsClient }) {
  const learningContent = await dependencies.lcmsClient.getLearningContent(configuration);
  if (learningContent) {
    for await (const table of tables) {
      await dependencies.databaseHelper.dropTable(table.name, configuration);
      await dependencies.databaseHelper.createTable(table, configuration);
      await dependencies.databaseHelper.saveLearningContent(table, learningContent[table.name], configuration);
    }
  }
}

export {
  run,
};
