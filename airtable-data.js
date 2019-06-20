const Airtable = require("airtable");
let base;

function init() {
  base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);
}

function ensureInit() {
  if (!base) {
    init();
  }
}

async function getDomains() {
  ensureInit();
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
  ensureInit();
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
  ensureInit();
  let tubes = [];
  try {
    await base('Tubes').select({
      fields: ['Nom', 'Titre', 'Description'],
      filterByFormula: `Competences='${competence.name.replace(/'/g, '\\\'')}'`
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
  ensureInit();
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
  ensureInit();
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

module.exports = {
  init,
  getDomains,
  getCompetences,
  getTubes,
  getSkills,
  getChallenges
}