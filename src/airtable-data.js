'use strict';

const Airtable = require('airtable');
const _ = require('lodash');
const format = require('pg-format');
const { runDBOperation } = require('./db-connection');

const tables = [{
  name: 'areas',
  airtableName: 'Domaines',
  fields: [
    { name: 'name', type: 'text', airtableName: 'Nom' },
  ],
  airtableId: 'id persistant',
  indices: [],
}, {
  name: 'attachments',
  airtableName: 'Attachments',
  fields: [
    { name: 'type', type: 'text', airtableName: 'type' },
    { name: 'challengeId', type: 'text', airtableName: 'challengeId persistant' },
    { name: 'alt', type: 'text', airtableName: 'alt' },
    { name: 'url', type: 'text', airtableName: 'url' },
    { name: 'size', type: 'numeric', airtableName: 'size' },
  ],
  airtableId: 'Record ID',
  indices: [],
}, {
  name: 'competences',
  airtableName: 'Competences',
  fields: [
    { name: 'name', type: 'text', airtableName: 'Référence' },
    { name: 'code', type: 'text', airtableName: 'Sous-domaine' },
    { name: 'title', type: 'text', airtableName: 'Titre' },
    { name: 'origin', type: 'text', airtableName: 'Origine' },
    { name: 'areaId', type: 'text', airtableName: 'Domaine (id persistant)', isArray: false },
  ],
  airtableId: 'id persistant',
  indices: ['areaId'],
}, {
  name: 'tubes',
  airtableName: 'Tubes',
  fields: [
    { name: 'name', type: 'text', airtableName: 'Nom' },
    { name: 'title', type: 'text', airtableName: 'Titre' },
    { name: 'competenceId', type: 'text', airtableName: 'Competences (id persistant)', isArray: false },
  ],
  airtableId: 'id persistant',
  indices: ['competenceId'],
}, {
  name: 'skills',
  airtableName: 'Acquis',
  fields: [
    { name: 'name', type: 'text', airtableName: 'Nom' },
    { name: 'description', type: 'text', airtableName: 'Description' },
    { name: 'level', type: 'smallint', airtableName: 'Level' },
    { name: 'tubeId', type: 'text', airtableName: 'Tube (id persistant)', isArray: false },
    { name: 'status', type: 'text', airtableName: 'Status' },
    { name: 'pixValue', type: 'numeric(6,5)', airtableName: 'PixValue' },
    { name: 'hintStatus', type: 'text', airtableName: 'Statut de l\'indice' },
    { name: 'tutorialIds', type: 'text []', airtableName: 'Comprendre (id persistant)', isArray: true },
    { name: 'learningMoreTutorialIds', type: 'text []', airtableName: 'En savoir plus (id persistant)', isArray: true },
    { name: 'internationalization', type: 'text', airtableName: 'Internationalisation' },
  ],
  airtableId: 'id persistant',
  indices: ['tubeId'],
}, {
  name: 'challenges',
  airtableName: 'Epreuves',
  fields: [
    { name: 'instructions', type: 'text', airtableName: 'Consigne' },
    { name: 'status', type: 'text', airtableName: 'Statut' },
    { name: 'type', type: 'text', airtableName: 'Type d\'épreuve' },
    { name: 'timer', type: 'smallint', airtableName: 'Timer' },
    { name: 'autoReply', type: 'boolean', airtableName: 'Réponse automatique' },
    { name: 'skillIds', type: 'text []', airtableName: 'Acquix (id persistant)', isArray: true },
    { name: 'skillCount', type: 'smallint', extractor: (record) => _.size(record.get('Acquix (id persistant)')) },
    { name: 'firstSkillId', type: 'text', extractor: (record) => _.get(record.get('Acquix (id persistant)'), 0) },
    { name: 'secondSkillId', type: 'text', extractor: (record) => _.get(record.get('Acquix (id persistant)'), 1) },
    { name: 'thirdSkillId', type: 'text', extractor: (record) => _.get(record.get('Acquix (id persistant)'), 2) },
    { name: 'languages', type: 'text []', airtableName: 'Langues', isArray: true },
    { name: 'embedUrl', type: 'text', airtableName: 'Embed URL' },
    { name: 'hasEmbedUrl', type: 'boolean', extractor: (record) => !!record.get('Embed URL') },
    { name: 'alternativeInstruction', type: 'text', airtableName: 'Consigne alternative' },
    { name: 'hasAlternativeInstruction', type: 'boolean', extractor: (record) => !!record.get('Consigne alternative') },
    { name: 'area', type: 'text', airtableName: 'Géographie' },
    { name: 'focus', type: 'boolean', airtableName: 'Focalisée' },
    { name: 'explicativeResponse', type: 'text', airtableName: 'Bonnes réponses à afficher' },
  ],
  airtableId: 'id persistant',
  indices: ['firstSkillId'],
}, {
  name: 'courses',
  airtableName: 'Tests',
  fields: [
    { name: 'name', type: 'text', airtableName: 'Nom' },
    { name: 'adaptive', type: 'boolean', airtableName: 'Adaptatif ?' },
    { name: 'competenceId', type: 'text', airtableName: 'Competence (id persistant)', isArray: false },
  ],
  airtableId: 'id persistant',
  indices: ['competenceId'],
}, {
  name: 'tutorials',
  airtableName: 'Tutoriels',
  fields: [
    { name: 'title', type: 'text', airtableName: 'Titre' },
    { name: 'link', type: 'text', airtableName: 'Lien' },
    { name: 'tutorialForSkills', type: 'text []', airtableName: 'Solution à', isArray: true },
    { name: 'furtherInformation', type: 'text []', airtableName: 'En savoir plus', isArray: true },
    { name: 'locale', type: 'text', airtableName: 'Langue' },
  ],
  airtableId: 'id persistant',
  indices: ['title'],
}];

async function fetchAndSaveData(configuration) {
  await Promise.all(tables.map(async (table) => {
    const data = await _getItems(table, configuration);
    await _dropTable(table.name, configuration);
    await _createTable(table, configuration);
    await _saveItems(table, data, configuration);
  }));
}

async function _dropTable(tableName, configuration) {
  return runDBOperation(async (client) => {
    const dropQuery = `DROP TABLE IF EXISTS ${format.ident(tableName)} CASCADE`;
    await client.query(dropQuery);
  }, configuration);
}

async function _createTable(table, configuration) {
  await runDBOperation(async (client) => {
    const fieldsText = ['"id" text PRIMARY KEY'].concat(table.fields.map((field) => {
      return format('\t%I\t%s', field.name, field.type + (field.type === 'boolean' ? ' NOT NULL' : ''));
    })).join(',\n');
    const createQuery = format('CREATE TABLE %I (%s)', table.name, fieldsText);
    await client.query(createQuery);
    for (const index of table.indices) {
      const indexQuery = format('CREATE INDEX %I on %I (%I)', `${table.name}_${index}_idx`, table.name, index);
      await client.query(indexQuery);
    }
  }, configuration);
}

async function _saveItems(table, items, configuration) {
  if (items.length) {
    await runDBOperation(async (client) => {
      const fields = ['id'].concat(table.fields.map((field) => field.name));
      const values = items.map((item) => fields.map((field) => item[field]));
      const saveQuery = format('INSERT INTO %I (%I) VALUES %L', table.name, fields, values);
      await client.query(saveQuery);
    }, configuration);
  }
}

function _initAirtable(configuration) {
  return new Airtable({ apiKey: configuration.AIRTABLE_API_KEY }).base(configuration.AIRTABLE_BASE);
}

async function _getItems(structure, configuration) {
  const base = _initAirtable(configuration);
  const fields = structure.fields;
  const airtableFields = _.compact(fields.map((field) => field.airtableName));
  if (structure.airtableId) {
    airtableFields.push(structure.airtableId);
  }
  const records = await base(structure.airtableName).select({
    fields: airtableFields,
  }).all();
  return records.map((record) => {
    const item = { id: record.get(structure.airtableId) || record.getId() };
    fields.forEach((field) => {
      let value = field.extractor ? field.extractor(record) : record.get(field.airtableName);
      if (Array.isArray(value)) {
        if (!field.isArray) {
          value = value[0];
        } else {
          value = `{${value.join(',')}}`;
        }
      }
      if (field.type === 'boolean') {
        value = Boolean(value);
      }
      item[field.name] = value;
    });
    return item;
  });
}

module.exports = {
  fetchAndSaveData,
};
