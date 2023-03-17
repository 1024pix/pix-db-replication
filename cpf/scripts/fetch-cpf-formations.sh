#! /bin/bash

set -eu

dbclient-fetcher pgsql "$PG_CLIENT_VERSION"

TABLE_NAME='external_opendata_caisse_des_depots_cpf_list'
DATASET_URL='https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=moncompteformation_catalogueformation&rows=2000&q=pix&facet=nom_departement&facet=nom_region&facet=rsrncp&facet=libelle_niveau_sortie_formation&facet=libelle_nsf_1&facet=code_certifinfo&facet=siret&facet=code_region&refine.rsrncp=RS'
OUTPUT_FILE='/tmp/exportcpf.csv'

psql "$DATABASE_URL" \
    -c "DROP TABLE IF EXISTS $TABLE_NAME; CREATE TABLE IF NOT EXISTS $TABLE_NAME (record_id TEXT, date_extract DATE, nom_of TEXT, intitule_formation TEXT, numero_formation TEXT)"

curl "$DATASET_URL" \
> /tmp/export.json

jq -r '.records[]|
    [ 
        ((.fields.numero_formation|ascii_downcase) + .fields.code_region + .fields.code_departement),
        .fields.date_extract, 
        .fields.nom_of, 
        .fields.intitule_formation, 
        .fields.numero_formation
    ]|
    join(";")' /tmp/export.json \
> "$OUTPUT_FILE"

psql "$DATABASE_URL" -c "\copy $TABLE_NAME FROM '$OUTPUT_FILE' DELIMITER ';';"
