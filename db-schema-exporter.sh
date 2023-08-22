#!/bin/bash
set -eu

if [ "${DB_SCHEMA_EXPORTER_ENABLED-x}" = "true" ]
then
    jq --null-input --compact-output '{level: "info", event: "db-schema-exporter", message: "Data Catalog enrichment starting"}'

    pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges --clean --if-exists > schema.sql

    psql       \
    --echo-all \
    "${DB_SCHEMA_EXPORTER_DATABASE_TARGET}" < schema.sql > "psql.log"

    while IFS= read -r LINE
    do
        jq --null-input       \
        --arg message "$LINE" \
        --compact-output '{level: "debug", event: "db-schema-exporter", $message}'
    done < "psql.log"

    jq --null-input --compact-output '{level: "ok", event: "db-schema-exporter", message: "Data Catalog enrichment ended successfully"}'
fi
