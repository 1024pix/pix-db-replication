pg_restore --verbose --no-owner -d postgresql://source_user@localhost/source_database ./local-setup/data/source.pgsql
pg_restore --verbose --no-owner -d postgresql://target_user@localhost/target_database ./local-setup/data/target.pgsql
