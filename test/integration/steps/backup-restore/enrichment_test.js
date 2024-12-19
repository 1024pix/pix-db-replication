import { expect } from 'chai';
import pgConnectionString from 'pg-connection-string';
const pgUrlParser = pgConnectionString.parse;

// CircleCI set up environment variables to access DB, so we need to read them here
// eslint-disable-next-line n/no-process-env
const DATABASE_URL = process.env.TARGET_DATABASE_URL || 'postgres://pix@localhost:5432/replication_target';

import { createAndFillDatabase } from '../../test-helper.js';
import { Database } from '../../../utils/database.js';

import { createIndexes, updateData } from '../../../../src/steps/backup-restore/enrichment.js';

describe('Integration | Steps | Backup restore | enrichment.js', function() {

  let databaseConfig;

  before(function() {
    const config = pgUrlParser(DATABASE_URL);

    databaseConfig = {
      serverUrl: `postgres://${config.user}@${config.host}:${config.port}`,
      databaseName: config.database,
      tableName: 'test_table',
      tableRowCount: 100000,
    };

    databaseConfig.databaseUrl = `${databaseConfig.serverUrl}/${databaseConfig.databaseName}`;
  });

  describe('createIndexes', function() {

    context('according to environment variables', function() {
      let database;

      after(function() {
        database.dropDatabase();
      });

      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          mode: 'none',
          itLabel: 'should not create indexes for tables on "none" mode',
          tables: ['knowledge-elements', 'knowledge-element-snapshots', 'answers', 'users', 'schooling-registrations'],
          'indexCount': 0,
        },
        {
          mode: 'incremental',
          itLabel: 'should not create indexes for tables on "incremental" mode',
          tables: ['knowledge-elements', 'knowledge-element-snapshots', 'answers', 'users', 'schooling-registrations'],
          'indexCount': 0,
        },
        {
          mode: '',
          itLabel: 'should create indexes for tables not specified in var env',
          tables: [],
          'indexCount': 1,
        },
      ].forEach(({ mode, itLabel, tables, indexCount }) =>
        it(itLabel, async function() {
          // given
          database = await Database.create(databaseConfig);
          await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported: true });

          // when
          const BACKUP_MODE = tables.reduce((tablesObject, tableName) =>
            ({ ...tablesObject, [tableName]: mode }), {});
          const configuration = { BACKUP_MODE, DATABASE_URL: databaseConfig.databaseUrl };
          await createIndexes(configuration);

          // then
          const KEIndexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'knowledge-elements_createdAt_idx\''));
          expect(KEIndexCount).to.equal(indexCount);

          // then
          const KESnapshotsIndexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'knowledge-element-snapshots_snappedAt_idx\''));
          expect(KESnapshotsIndexCount).to.equal(indexCount);

          // then
          const answersIndexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'answers_challengeId_idx\''));
          expect(answersIndexCount).to.equal(indexCount);

          const usersIndexCount = parseInt(await database.runSql('SELECT COUNT(1) FROM pg_indexes ndx WHERE ndx.indexname = \'users_createdAt_idx\''));
          expect(usersIndexCount).to.equal(indexCount);
        }));
    });
  });

  describe('updateData', function() {
    describe('when table is not backup/restored', function() {
      let database;

      after(function() {
        database.dropDatabase();
      });

      it('should not update the table', async function() {
        // given
        database = await Database.create(databaseConfig);
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
        const BACKUP_MODE = { 'authentication-methods': 'none' };
        const configuration = { BACKUP_MODE, DATABASE_URL: databaseConfig.databaseUrl };

        // when
        await updateData(configuration);

        // then
        const passwordsString = await database.runSql('SELECT "authenticationComplement" -> \'password\' FROM "authentication-methods"');
        expect(passwordsString.length).to.greaterThan(19);
      });
    });

    describe('when the provider is not PIX', function() {
      let database;

      after(function() {
        database.dropDatabase();
      });

      it('should not update the password', async function() {
        // given
        database = await Database.create(databaseConfig);
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
        const otherProviderPassword = '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
        await database.runSql(`INSERT INTO "authentication-methods"(id, "identityProvider", "authenticationComplement") VALUES (3, 'OTHER',  '{"password":"${otherProviderPassword}"}'::jsonb)`);
        const configuration = { BACKUP_MODE: {}, DATABASE_URL: databaseConfig.databaseUrl };

        // when
        await updateData(configuration);

        // then
        const passwordsString = await database.runSql('SELECT "authenticationComplement" -> \'password\' FROM "authentication-methods" WHERE "identityProvider" = \'OTHER\'');
        expect(passwordsString).to.equal(`"${otherProviderPassword}"`);
      });
    });

    describe('when table is backup/restored', function() {
      let database;

      after(function() {
        database.dropDatabase();
      });

      it('should update the passwords', async function() {
        // given
        database = await Database.create(databaseConfig);
        await createAndFillDatabase(database, databaseConfig, { createTablesNotToBeImported: true });
        const configuration = { BACKUP_MODE: {}, DATABASE_URL: databaseConfig.databaseUrl };

        // when
        await updateData(configuration);

        // then
        const passwordsString = await database.runSql('SELECT "authenticationComplement" -> \'password\' FROM "authentication-methods"');
        expect(passwordsString.length).to.equal(19);
      });
    });

  });
});
