const extractConfigurationFromEnvironment = require ('../../src/extract-configuration-from-environment');
const configuration = extractConfigurationFromEnvironment();
const Database = require('../utils/database');
const pgUrlParser = require('pg-connection-string').parse;

const parsedConnectionString = pgUrlParser(configuration.DATABASE_URL);

const databaseConfig = {
  serverUrl: `postgres://${parsedConnectionString.user}@${parsedConnectionString.host}:${parsedConnectionString.port}`,
  databaseName: parsedConnectionString.database
};

const database = new Database(databaseConfig.serverUrl, databaseConfig.databaseName);
return database.createUser();
