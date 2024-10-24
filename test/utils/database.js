import { execa } from 'execa';
import * as tmp from 'tmp-promise';
import pgConnectionString from 'pg-connection-string';
const pgUrlParser = pgConnectionString.parse;

export class Database {

  constructor(serverUrl, databaseName) {
    this._serverUrl = serverUrl;
    this._databaseName = databaseName;
    this._databaseUrl = `${this._serverUrl}/${this._databaseName}`;
    const config = pgUrlParser(this._databaseUrl);
    this._user = config.user;
    this._superUserServerUrl = `postgres://postgres@${config.host}:${config.port}`;
    this._superUserDatabaseUrl = `${this._superUserServerUrl}/${config.database}`;
  }

  static async create({ serverUrl, databaseName }) {
    const database = new Database(serverUrl, databaseName);
    await database.dropDatabase();
    await database.createDatabase();
    await database.createUser();
    return database;
  }

  async runSql(...sqlCommands) {
    const { stdout } = await execa('psql', [
      this._databaseUrl, '--tuples-only', '--no-align',
      ...sqlCommands.map((sqlCommand) => `--command=${sqlCommand}`),
    ]);
    return stdout;
  }

  async runSqlAsSuperUser(...sqlCommands) {
    const { stdout } = await execa('psql', [
      this._superUserDatabaseUrl, '--tuples-only', '--no-align',
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
    await execa('psql', [ this._superUserServerUrl,
      '--echo-all', '--set', 'ON_ERROR_STOP=on', '--command', `CREATE DATABASE "${this._databaseName}"`,
    ]);
  }

  async dropDatabase() {
    await execa('psql', [ this._superUserServerUrl,
      '--echo-all', '--set', 'ON_ERROR_STOP=on', '--command', `DROP DATABASE IF EXISTS "${this._databaseName}"`,
    ]);
  }

  async createBackup() {
    const path = await tmp.tmpName();
    await execa('pg_dump', [
      '--format=c',
      '--no-owner',
      '--no-privileges',
      `--file=${path}`,
      this._superUserDatabaseUrl,
    ], { stdio: 'inherit' });
    return path;
  }

  async hasTable(tableName) {
    const tableExists = await this.runSql('SELECT EXISTS (' +
      '   SELECT FROM pg_tables' +
      `   WHERE tablename = '${tableName}'` +
      '   );');

    return tableExists === 't';
  }

}
