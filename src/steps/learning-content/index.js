import * as lcmsClient from './lcms-client.js';
import * as databaseHelper from '../../database-helper.js';
import { NoLearningContentError } from './../../errors.js';
import { logger } from './../../logger.js';

const LCMS_CHUNK_SIZE = 2000;

const tables = [{
  name: 'frameworks',
  fields: [
    { name: 'name', type: 'text' },
  ],
  indexes: [],
}, {
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
    { name: 'filename', type: 'text' },
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
  name: 'thematics',
  fields: [
    { name: 'name', type: 'text', extractor: (record) => record['name_i18n']['fr'] },
    { name: 'index', type: 'text', extractor: (record) => record['id'] },
    { name: 'competenceId', type: 'text', isArray: false },
    { name: 'tubeIds', type: 'text', isArray: true },
  ],
  indexes: ['index'],
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
    { name: 'hint', type: 'text', extractor: (record) => record.hint_i18n.fr },
    { name: 'hintStatus', type: 'text' },
    { name: 'tutorialIds', type: 'text []', isArray: true },
    { name: 'learningMoreTutorialIds', type: 'text []', isArray: true },
    { name: 'internationalisation', type: 'text' },
    { name: 'version', type: 'smallint' },
    { name: 'createdAt', type: 'timestamptz' },
    { name: 'activatedAt', type: 'timestamptz' },
    { name: 'archivedAt', type: 'timestamptz' },
    { name: 'obsoletedAt', type: 'timestamptz' },
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
    { name: 'embedTitle', type: 'text' },
    { name: 'hasEmbedUrl', type: 'boolean', extractor: (record) => !!record['embedUrl'] },
    { name: 'alternativeInstruction', type: 'text' },
    { name: 'hasAlternativeInstruction', type: 'boolean', extractor: (record) => !!record['alternativeInstruction'] },
    { name: 'area', type: 'text', extractor: (record) => record.geography },
    { name: 'focus', type: 'boolean', extractor: (record) => !!record['focusable'] },
    { name: 'explicativeResponse', type: 'text', extractor: (record) => record['solutionToDisplay'] },
    { name: 'createdAt', type: 'timestamptz' },
    { name: 'validatedAt', type: 'timestamptz' },
    { name: 'archivedAt', type: 'timestamptz' },
    { name: 'madeObsoleteAt', type: 'timestamptz' },
    { name: 'accessibility1', type: 'text' },
    { name: 'accessibility2', type: 'text' },
    { name: 'spoil', type: 'text' },
    { name: 'responsive', type: 'text' },
    { name: 'deafAndHardOfHearing', type: 'text' },
    { name: 'requireGafamWebsiteAccess', type: 'boolean' },
    { name: 'isIncompatibleIpadCertif', type: 'boolean' },
    { name: 'toRephrase', type: 'boolean' },
    { name: 'isAwarenessChallenge', type: 'boolean' },
    { name: 'isQualityOk', type: 'boolean' },
    { name: 'genealogy', type: 'text' },
    { name: 'version', type: 'smallint' },
    { name: 'alternativeVersion', type: 'smallint' },
    { name: 'declinable', type: 'text' },
    { name: 'proposals', type: 'text' },
    { name: 'solution', type: 'text' },
    { name: 'pedagogy', type: 'text' },
    { name: 'shuffled', type: 'boolean', extractor: (record) => !!record['shuffled'] },
    { name: 'urlsToConsult', type: 'text []', isArray: true },
    { name: 'format', type: 'text' },
    { name: 'assessmentMaintenanceTags', type: 'text []', isArray: true },
    { name: 'translationMaintenanceTags', type: 'text []', isArray: true },
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
    { name: 'duration', type: 'text' },
    { name: 'format', type: 'text' },
    { name: 'link', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'locale', type: 'text' },
  ],
  indexes: ['title'],
}, {
  name: 'missions',
  fields: [
    { name: 'name', type: 'text', extractor: (record) => record.name_i18n.fr },
    { name: 'cardImageUrl', type: 'text' },
    { name: 'competenceId', type: 'text', isArray: false },
    { name: 'thematicIds', type: 'text', isArray: true },
    { name: 'learningObjectives', type: 'text', extractor: (record) => record.learningObjectives_i18n.fr },
    { name: 'validatedObjectives', type: 'text', extractor: (record) => record.validatedObjectives_i18n.fr },
    { name: 'introductionMediaUrl', type: 'text' },
    { name: 'introductionMediaType', type: 'text' },
    { name: 'introductionMediaAlt', type: 'text', extractor: (record) => record.introductionMediaAlt_i18n.fr },
    { name: 'status', type: 'text' },
    { name: 'documentationUrl', type: 'text' },
    { name: 'content', type: 'jsonb', extractor: (record) => JSON.stringify(record.content) },
  ],
  indexes: [],
},
{
  name: 'learning-content-translations',
  sourceName: 'translations',
  fields: [
    { name: 'key', type: 'text', extractor: extractTranslationsKey },
    { name: 'locale', type: 'text' },
    { name: 'value', type: 'text' },
    { name: 'model', type: 'text' },
    { name: 'entityId', type: 'text' },
    { name: 'sourceEntityId', type: 'text' },
  ],
  indexes: [],
},
];

export async function run(configuration, dependencies = { databaseHelper: databaseHelper, lcmsClient: lcmsClient }) {
  logger.info(`Learning content replication : tables ${tables.map((table) => table.name).join([', '])}`);

  try {
    for (const table of tables) {
      await dependencies.databaseHelper.dropTable(table.name, configuration);
      await dependencies.databaseHelper.createTable(table, configuration);
    }

    const learningContentStream = dependencies.lcmsClient.streamLearningContent(configuration);

    for await (const { type, values } of getLearningContentChunks(learningContentStream)) {
      const table = getTableForType(type);
      if (table === undefined) continue;

      await dependencies.databaseHelper.saveLearningContent(table, values, configuration);
    }
  } catch (err) {
    logger.error({ err }, 'Error in learning content replication');
    throw new NoLearningContentError({ cause: err });
  }
}

export async function* getLearningContentChunks(learningContentStream, chunkSize = LCMS_CHUNK_SIZE) {
  let values;
  let currentType;

  for await (const { type, value } of learningContentStream) {
    if (values !== undefined && values.length < chunkSize && type === currentType) {
      values.push(value);
      continue;
    }

    if (values !== undefined) {
      yield {
        type: currentType,
        values,
      };
    }

    currentType = type;
    values = [value];
  }

  if (values !== undefined && values.length > 0) {
    yield {
      type: currentType,
      values,
    };
  }
}

function getTableForType(type) {
  const table = tables.find(({ name, sourceName }) => (sourceName ?? name) === type);
  if (table === undefined) {
    logger.warn({ type }, 'unknown learning content type, values will be discarded');
  }
  return table;
}

export function extractTranslationsKey(record) {
  const [model, id, field] = record.key.split('.');

  if (model !== 'challenge' || field !== 'solutionToDisplay') {
    return record.key;
  }
  return `${model}.${id}.explicativeResponse`;
}
