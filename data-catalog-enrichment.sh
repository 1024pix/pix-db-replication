#!/bin/bash
set -eu

if [ "${DATA_CATALOG_ENRICHMENT_ENABLED-x}" = "true" ]
then
    jq --null-input --compact-output '{level: "info", event: "data_catalog_enrichment", message: "Data Catalog enrichment starting"}'

    pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges --clean --if-exists > schema.sql

    psql       \
    --echo-all \
    "$DATA_CATALOG_DATABASE_URL" < schema.sql > "psql.log"

    while IFS= read -r LINE
    do
        jq --null-input       \
        --arg message "$LINE" \
        --compact-output '{level: "debug", event: "data_catalog_enrichment", $message}'
    done < "psql.log"

    jq --null-input --compact-output '{level: "ok", event: "data_catalog_enrichment", message: "Data Catalog enrichment ended successfully"}'
fi
