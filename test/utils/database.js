const execa = require('execa');
const tmp = require('tmp-promise');
const pgUrlParser = require('pg-connection-string').parse;

module.exports = class Database {
  constructor(serverUrl, databaseName) {
    this._serverUrl = serverUrl;
    this._databaseName = databaseName;
    this._databaseUrl = `${this._serverUrl}/${this._databaseName}`;
    const config = pgUrlParser(this._databaseUrl);
    this._user = config.user;
    this._superUserServerUrl = `postgres://postgres@${config.host}:${config.port}`;
    this._superUserDatabaseUrl = `${this._superUserServerUrl}/${config.database}`;
  }

  static async create({ serverUrl, databaseName, tableName, tableRowCount }) {
    const database = new Database(serverUrl, databaseName, tableName, tableRowCount);
    await database.dropDatabase();
    await database.createDatabase();
    await database.createUser();
    return database;
  }

  async runSql(...sqlCommands) {
    const { stdout } = await execa('psql', [
      this._databaseUrl,
      '--tuples-only',
      '--no-align',
      ...sqlCommands.map((sqlCommand) => `--command=${sqlCommand}`),
    ]);
    return stdout;
  }

  async runSqlAsSuperUser(...sqlCommands) {
    const { stdout } = await execa('psql', [
      this._superUserDatabaseUrl,
      '--tuples-only',
      '--no-align',
      ...sqlCommands.map((sqlCommand) => `--command=${sqlCommand}`),
    ]);
    return stdout;
  }

  async createUser() {
    await this.runSqlAsSuperUser(
      `CREATE USER ${this._user}`,
      `GRANT CONNECT ON DATABASE ${this._databaseName} TO ${this._user}`,
      `GRANT USAGE ON SCHEMA public TO ${this._user}`,
      `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${this._user}`,
    );
  }

  async createDatabase() {
    await execa('psql', [
      this._superUserServerUrl,
      '--echo-all',
      '--set',
      'ON_ERROR_STOP=on',
      '--command',
      `CREATE DATABASE "${this._databaseName}"`,
    ]);
  }

  async dropDatabase() {
    await execa('psql', [
      this._superUserServerUrl,
      '--echo-all',
      '--set',
      'ON_ERROR_STOP=on',
      '--command',
      `DROP DATABASE IF EXISTS "${this._databaseName}"`,
    ]);
  }

  async createBackup() {
    const path = await tmp.tmpName();
    await execa('pg_dump', ['--format=c', `--file=${path}`, this._superUserDatabaseUrl], { stdio: 'inherit' });
    return path;
  }
};
