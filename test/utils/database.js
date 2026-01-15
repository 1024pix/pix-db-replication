import { execStdOut, exec } from '../../src/exec.js';
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
    return database;
  }

  async runSql(...sqlCommands) {
    const commands = sqlCommands.map((sqlCommand) => `--command=${sqlCommand}`);
    const stdout = await execStdOut('psql', [this._databaseUrl, '--tuples-only', '--no-align', ...commands]);
    return stdout;
  }

  async runSqlAsSuperUser(...sqlCommands) {
    const commands = sqlCommands.map((sqlCommand) => `--command=${sqlCommand}`);
    const stdout = await exec('psql', [this._superUserDatabaseUrl, '--tuples-only', '--no-align', ...commands]);
    return stdout;
  }

  async createDatabase() {
    const command = `CREATE DATABASE ${this._databaseName}`;
    await exec('psql', [this._superUserServerUrl, '--echo-all', '--set', 'ON_ERROR_STOP=on', '--command', command]);

    await this.runSqlAsSuperUser(
      `CREATE USER ${this._user}`,
      `ALTER DATABASE ${this._databaseName} OWNER TO ${(this._user)}`,
    );
  }

  async dropDatabase() {
    const command = `DROP DATABASE IF EXISTS ${this._databaseName}`;
    await exec('psql', [this._superUserServerUrl, '--echo-all', '--set', 'ON_ERROR_STOP=on', '--command', command]);
  }

  async createBackup() {
    const path = await tmp.tmpName();
    await exec('pg_dump', ['--format=c', '--no-owner', '--no-privileges', `--file=${path}`, this._superUserDatabaseUrl]);
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
