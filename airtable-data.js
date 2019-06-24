const Airtable = require("airtable");
const { Client } = require('pg');
const format = require('pg-format');
let base;

function initAirtable() {
  base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
}

async function getDBClient() {
  client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  return client;
}

function ensureInitAirtable() {
  if (!base) {
    initAirtable();
  }
}

async function getDomains() {
  ensureInitAirtable();
  let domains = [];
  try {
    await base('Domaines').select({
      fields: ['Nom'],
      sort: [{field: 'Nom', direction: 'asc'}]
    }).eachPage(function page(records, fetchNextPage) {
      domains = records.reduce((list, record) => {
        list.push({name:record.get('Nom'),recordId:record.getId()});
        return list;
      }, domains);
      fetchNextPage();
    })
    return domains;
  } catch (error) {
    console.error(error);
  }
}

async function getCompetences(domain) {
  ensureInitAirtable();
  let competences = [];
  try {
    await base('Competences').select({
      fields: ['Référence', 'Sous-domaine', 'Titre'],
      filterByFormula: `Domaine='${domain.name}'`
    }).eachPage(function page(records, fetchNextPage) {
      competences = records.reduce((list, record) => {
        list.push({name:record.get('Référence'), code:record.get('Sous-domaine'),title:record.get('Titre'),recordId:record.getId(), domainRecordId:domain.recordId});
        return list;
      }, competences);
      fetchNextPage();
    })
    return competences;
  }
  catch (error) {
    console.error(error);
  }
}

async function getTubes(competence) {
  ensureInitAirtable();
  let tubes = [];
  try {
    await base('Tubes').select({
      fields: ['Nom', 'Titre', 'Description'],
      filterByFormula: `Competences='${_escape(competence.name)}'`
    }).eachPage(function page(records, fetchNextPage) {
      tubes = records.reduce((list, record) => {
        list.push({name:record.get('Nom'),title:record.get('Titre'),description:record.get('Description'), recordId:record.getId(), competenceRecordId:competence.recordId});
        return list;
      }, tubes);
      fetchNextPage();
    });
    return tubes;
  }
  catch (error) {
    console.error(error);
  }
}

async function getSkills(tube) {
  ensureInitAirtable();
  let skills = [];
  try {
    await base('Acquis').select({
      fields: ['Nom', 'Description', 'Level', 'PixValue'],
      filterByFormula: `AND(Tube='${tube.name}', Status='actif')`
    }).eachPage(function page(records, fetchNextPage) {
      skills = records.reduce((list, record) => {
        list.push({name:record.get('Nom'),description:record.get('Description'),recordId:record.getId(), tubeRecordId:tube.recordId, level:record.get('Level')});
        return list;
      }, skills);
      fetchNextPage();
    });
    return skills;
  }
  catch (error) {
    console.error(error);
  }
}

async function getChallenges(skill) {
  ensureInitAirtable();
  let challenges = [];
  try {
    await base('Epreuves').select({
      fields: ['Consigne'],
      filterByFormula: `AND(Acquix='${skill.name}', OR(Statut='pré-validé', Statut='validé sans test', Statut='validé'))`
    }).eachPage(function page(records, fetchNextPage) {
      skills = records.reduce((list, record) => {
        list.push({instructions:record.get('Consigne'),recordId:record.getId(), skillRecordId:skill.recordId});
        return list;
      }, challenges);
      fetchNextPage();
    });
    return challenges;
  }
  catch (error) {
    console.error(error);
  }
}

async function saveDomains(domains) {
  try {
    const client = await getDBClient();
    await _createTable('domains', {id:'SERIAL PRIMARY KEY', name:'text', recordId:'varchar(17)'}, ['recordId']);
    await _fillTable('domains', domains);
    await client.end();
  } catch (error) {
    console.error(error);
    await client.end();
  }
}

async function saveCompetences(competences) {
  try {
      const client = await getDBClient();
      await _createTable('competences', {id:'SERIAL PRIMARY KEY', name:'text', code:'varchar(5)', title:'text', recordId:'varchar(17)', domainRecordId:'varchar(17)'}, ['recordId', 'domainRecordId']);
      await _fillTable('competences', competences);
      await client.end();
  } catch (error) {
    console.error(error);
    await client.end();
  }
}

async function saveTubes(tubes) {
  try {
    const client = await getDBClient();
    await _createTable('tubes', {id:'SERIAL PRIMARY KEY', name:'text', title:'text', description:'text', recordId:'varchar(17)', competenceRecordId:'varchar(17)'}, ['recordId', 'competenceRecordId']);
    await _fillTable('tubes', tubes);
    await client.end();
  } catch (error) {
    console.error(error);
    await client.end();
  }
}

async function saveSkills(skills) {
  try {
    const client = await getDBClient();
    await _createTable('skills', {id:'SERIAL PRIMARY KEY', name:'text', level:'smallint', description:'text', recordId:'varchar(17)', tubeRecordId:'varchar(17)'}, ['recordId', 'tubeRecordId']);
    await _fillTable('skills', skills);
    await client.end();
  } catch (error) {
    console.error(error);
    await client.end();
  }
}

async function saveChallenges(challenges) {
  try {
    const client = await getDBClient();
    await _createTable('challenges', {id:'SERIAL PRIMARY KEY', instructions:'text', recordId:'varchar(17)', skillRecordId:'varchar(17)'}, ['recordId', 'skillRecordId']);
    await _fillTable('challenges', challenges);
    await client.end();
  } catch (error) {
    console.error(error);
    await client.end();
  }
}

async function _createTable(tableName, fields, indeces) {
  const fieldTexts = Object.keys(fields).map(field => `\t"${field}"\t${fields[field]}`);
  const fieldText = fieldTexts.join(',\n');
  try {
    await client.query(`CREATE TABLE "${tableName}" (${fieldText})`)
    let indexText = '';
    if (indeces) {
      indeces.forEach(async index => {
        await client.query(`CREATE INDEX "${tableName}_${index}_idx" ON "${tableName}" ("${index}")`);
      })
    }
  } catch (error) {
    console.error(error);
  }
}

async function _fillTable(tableName, items) {
  const fields = Object.keys(items[0]);
  const fieldText = `"${fields.join('","')}"`;
  const stackedItems = items.map(item => fields.map(field => item[field]));
  const query = format(`INSERT INTO "${tableName}" (${fieldText}) VALUES %L `, stackedItems);
  await client.query(query);
}

function _escape(text) {
  return text.replace(/'/g, '\\\'');
}

module.exports = {
  getDomains,
  getCompetences,
  getTubes,
  getSkills,
  getChallenges,
  saveDomains,
  saveCompetences,
  saveTubes,
  saveSkills,
  saveChallenges
}