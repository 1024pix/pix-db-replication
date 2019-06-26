const Airtable = require("airtable");
const { Client } = require('pg');
const format = require('pg-format');

const tables = [{
    name:'domains',
    airtableName:'Domaines',
    fields: [
      {name:'name', type:'text', airtableName:'Nom'}
    ],
    indices: []
  },{
    name:'competences',
    airtableName:'Competences',
    fields: [
      {name:'name', type:'text', airtableName:'Référence'},
      {name:'code', type:'text', airtableName:'Sous-domaine'},
      {name:'title', type:'text', airtableName:'Titre'},
      {name:'domainRecordId', type:'text', airtableName:'Domaine', isArray:false}
    ],
    indices: ['domainRecordId']
  },{
    name:'tubes',
    airtableName:'Tubes',
    fields: [
      {name:'name', type:'text', airtableName:'Nom'},
      {name:'title', type:'text', airtableName:'Titre'},
      {name:'competenceRecordId', type:'text', airtableName:'Competences', isArray:false}
    ],
    indices: ['competenceRecordId']
  },{
    name:'skills',
    airtableName:'Acquis',
    fields: [
      {name:'name', type:'text', airtableName:'Nom'},
      {name:'description', type:'text', airtableName:'Description'},
      {name:'level', type:'smallint', airtableName:'Level'},
      {name:'tubeRecordId', type:'text', airtableName:'Tube', isArray:false},
      {name:'status', type:'text', airtableName:'Status'}
    ],
    indices: ['tubeRecordId']
  },{
    name:'challenges',
    airtableName:'Epreuves',
    fields: [
      {name:'instructions', type:'text', airtableName:'Consigne'},
      {name:'skillRecordIds', type:'text []', airtableName:'Acquix', isArray:true}
    ],
    indices: ['skillRecordIds']
  }, {
    name:'tests',
    airtableName:'Tests',
    fields: [
      {name:'name', type:'text', airtableName:'Nom'},
      {name:'adaptative', type:'boolean', airtableName:'Adaptatif ?'},
      {name:'competenceRecordId', type:'text', airtableName:'Competence', isArray:false}
    ],
    indices: ['competenceRecordId']
  }
];

async function fetchAndSaveData() {
  const tableNames = tables.map((table) => table.name);
  _dropTables(tableNames);
  for (const table of tables) {
    const data = await _getItems(table);
    await _createTable(table);
    await _saveItems(table, data);
  }
}

async function _withDBClient(callback) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

async function _dropTables(tableNames) {
  await _withDBClient(async (client) => {
    const dropQuery = tableNames.map((name) => `DROP TABLE IF EXISTS ${format.ident(name)} CASCADE;`).join('\n');
    await client.query(dropQuery);
  });
}

async function _createTable(table) {
  await _withDBClient(async (client) => {
    const fieldsText = ['"recordId" text PRIMARY KEY'].concat(table.fields.map((field) => format('\t%I\t%s', field.name, field.type))).join(',\n');
    const createQuery = format(`CREATE TABLE %I (%s)`, table.name, fieldsText);
    await client.query(createQuery)
    for (const index of table.indices) {
      const indexQuery = format (`CREATE INDEX %I on %I (%I)`, `${table.name}_${index}_idx`, table.name, index);
      await client.query(indexQuery);
    }
  });
}

async function _saveItems(table, items) {
  await _withDBClient(async (client) => {
    const fields = ['recordId'].concat(table.fields.map((field) => field.name));
    const values = items.map((item) => fields.map((field) => item[field]));
    const saveQuery = format(`INSERT INTO %I (%I) VALUES %L`, table.name, fields, values)
    await client.query(saveQuery);
  });
}

function _initAirtable() {
  return new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
}

async function _getItems(structure) {
  const base = _initAirtable();
  const fields = structure.fields;
  const airtableFields = fields.map(field => field.airtableName);
  records = await base(structure.airtableName).select({
    fields: airtableFields
  }).all();
  return records.map(record => {
    const item = {recordId:record.getId()};
    fields.forEach(field => {
      let value = record.get(field.airtableName);
      if (Array.isArray(value)) {
        if (!field.isArray) {
          value = value[0];
        } else {
          value = `{${value.join(',')}}`;
        }
      }
      item[field.name] = value;
    });
    return item;
  });
}

module.exports = {
  fetchAndSaveData
}
