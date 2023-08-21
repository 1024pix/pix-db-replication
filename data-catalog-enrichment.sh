#!/bin/bash
set -eu

if [ "${DATA_CATALOG_ENRICHMENT_ENABLED-x}" = "true" ]
then
    jq --null-input --compact-output '{event: "data_catalog_enrichment", message: "Data Catalog enrichment starting"}'

    pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges --clean --if-exists > schema.sql

    psql -eab "$DATA_CATALOG_DATABASE_URL" < schema.sql

    jq --null-input --compact-output '{event: "data_catalog_enrichment", message: "Data Catalog enrichment ended successfully"}'
fi
