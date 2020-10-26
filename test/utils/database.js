const execa = require('execa');
const tmp = require('tmp-promise');
module.exports = class Database {

  constructor(serverUrl, databaseName, tableName, tableRowCount) {
    this._serverUrl = serverUrl;
    this._databaseName = databaseName;
    this._databaseUrl = `${this._serverUrl}/${this._databaseName}`;
    // TODO: le supprimer, ils seront passés en argument
    this._tableName = tableName;
    this._tableRowCount = tableRowCount;
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
  // TODO: récupérer le nom de la table en argument
  async createTables() {
    await this.runSql(
      `CREATE TABLE ${this._tableName}(id int NOT NULL PRIMARY KEY)`,
      `COMMENT ON TABLE ${this._tableName} IS 'test comment'`
    );
  }

  // TODO: récupérer le nom de la table en argument
  async fillTables() {
    try {
      await this.runSql(
        `INSERT INTO ${this._tableName}(id) SELECT x FROM generate_series(1, ${this._tableRowCount}) s(x)`
      );
    } catch (err) {
      console.log(err);
    }
  }

  // TODO: déplacer dans le helper
  async createTablesThatMayNotBeRestored() {
    await this.runSql('CREATE TABLE answers (id int NOT NULL PRIMARY KEY, "challengeId" CHARACTER VARYING(255) )');
    await this.runSql('CREATE TABLE "knowledge-elements" (id int NOT NULL PRIMARY KEY, "userId" INTEGER, "createdAt" TIMESTAMP WITH TIME ZONE)');
    await this.runSql('CREATE INDEX "knowledge_elements_userid_index" ON "knowledge-elements" ("userId")');
  }

  // TODO: déplacer dans le helper
  async createTableWithForeignKey() {
    await this.runSql(`CREATE TABLE referencing (id INTEGER REFERENCES ${this._tableName})`);
  }

  // TODO: déplacer dans le helper
  async createTableToBeIndexed() {
    await this.runSql('CREATE TABLE users (id INT NOT NULL PRIMARY KEY, "createdAt" TIMESTAMP WITH TIME ZONE)');
  }

  // TODO: déplacer dans le helper
  async createTableToBeBaseForView() {
    await this.runSql('CREATE TABLE "schooling-registrations" (id INT NOT NULL PRIMARY KEY)');
  }

  // TODO: déplacer dans le helper
  async createAndFillDatabase({ createTablesNotToBeImported = false, createForeignKeys = false }) {
    await this.createTables();
    await this.fillTables();
    await this.createTableToBeIndexed();
    await this.createTableToBeBaseForView();

    if (createTablesNotToBeImported) {
      await this.createTablesThatMayNotBeRestored();
    }
    if (createForeignKeys) {
      await this.createTableWithForeignKey();
    }
  }
};
