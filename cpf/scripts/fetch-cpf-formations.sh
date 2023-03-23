#! /bin/bash

set -eu

if command -v dbclient-fetcher &> /dev/null; then
    dbclient-fetcher pgsql "$PG_CLIENT_VERSION"
fi

if [ -z "${TABLE_NAME+x}" ]; then
    TABLE_NAME='external_opendata_caisse_des_depots_cpf_list'
fi

if [ -z "${DATASET_URL+x}" ]; then
    DATASET_URL='https://opendata.caissedesdepots.fr/api/records/1.0/search/?dataset=moncompteformation_catalogueformation&q=&rows=2000&facet=nom_departement&facet=nom_region&facet=rsrncp&facet=libelle_niveau_sortie_formation&facet=libelle_nsf_1&facet=libelle_nsf_2&facet=libelle_nsf_3&facet=code_certifinfo&facet=siret&facet=code_region&refine.intitule_certification=Certificat+Pix'
fi

if [ -z "${DATABASE_URL+x}" ]; then
    DATABASE_URL='postgres://postgres@localhost:5432/postgres'
fi

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
