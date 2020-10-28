const execa = require('execa');
const tmp = require('tmp-promise');

module.exports = class Database {

  constructor(serverUrl, databaseName) {
    this._serverUrl = serverUrl;
    this._databaseName = databaseName;
    this._databaseUrl = `${this._serverUrl}/${this._databaseName}`;
  }

  static async create({ serverUrl, databaseName, tableName, tableRowCount }) {
    const database = new Database(serverUrl, databaseName, tableName, tableRowCount);
    await database.dropDatabase();
    await database.createDatabase();
    return database;
  }

  async runSql(...sqlCommands) {
    const { stdout } = await execa('psql', [
      this._databaseUrl, '--tuples-only', '--no-align',
      ...sqlCommands.map((sqlCommand) => `--command=${sqlCommand}`)
    ]);
    return stdout;
  }

  async createDatabase() {
    await execa('psql', [ this._serverUrl,
      '-v', 'ON_ERROR_STOP=1', '--command', `CREATE DATABASE "${this._databaseName}"`,
    ]);
  }

  async dropDatabase() {
    await execa('psql', [ this._serverUrl,
      '-v', 'ON_ERROR_STOP=1', '--command', `DROP DATABASE IF EXISTS "${this._databaseName}"`,
    ]);
  }

  async createBackup() {
    const path = await tmp.tmpName();
    await execa('pg_dump', [
      '--format=c',
      `--file=${path}`,
      this._databaseUrl,
    ], { stdio: 'inherit' });
    return path;
  }
};
