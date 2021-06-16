# Application de datawarehouse Pix

## Enjeux et contraintes
Ce projet a pour but de mettre à disposition des ressources facilement exploitables et réglementaires auprès :
- d'utilisateurs internes (développeurs, PO, support, métiers, ...)
- d'utilisateurs externes (partenaires, membres d'une organisation dans PixOrga, ...)

Les contraintes majeures sont :
- disposer des données les plus récentes
- ne pas impacter la performance de la BDD
- ne donner accès qu'aux utilisateurs autorisés.

## Approche
Pour respecter nos enjeux, nous avons dessiné l'approche suivante :
- importer chaque nuit _l'intégralité_ des données de production dans une BDD dite "interne"
- importer chaque nuit _une partie_ des données de production dans une BDD dite "externe"
- dans Metabase, les utilisateurs externes sont réglementairement restraints à l'utilisation de la BDD "externe"
- suite à l'import, créer des objets supplémentaires pour assurer un temps d'exécution des rapports acceptables (index, vues matérialisées,...)

## Produit
Les possibilités suivantes sont disponibles :
- exécuter des rapports dans Metabase
- exécuter des requêtes SQL

## Pré-requis
Ce projet est prévu pour être déployé sur une application Scalingo associée à une base de donnée PostgreSQL.

Des variables d'environnement sont mises en place afin de garder un seul repository partagé par les applications.

## Utilisation sur Scalingo

### Paramétrage
Alimenter les variables d'environnement documentées dans le fichier [sample.env](sample.env)

Pour satisfaire les contraintes de déploiement Scalingo, le [Procfile](Procfile) déclare un conteneur de type `web` qui démarre un serveur Web "vide".
 
Une fois l'application créée et déployée une première fois, il faut : 
- mettre à 0 le nombre de conteneurs de type `web` 
- mettre à 1 le nombre de conteneurs de type `background`.

### Exécution hors tâche planifiée
Un traitement peut être lancé immédiatement (hors tâche planifiée) en exécutant un script dédié un conteneur one-off 

#### Sur la BDD destinée aux internes

Deux traitements (dump et incrémentale) sont exécutés chaque nuit
* si l'un d'eux échoue, le relancer
* si les deux échouent, les relancer parallèle 

Lancer la réplication par dump
``` bash
scalingo run --region osc-secnum-fr1 -a pix-datawarehouse-production --size M --detached node ./src/run.js
```

Lancer la réplication incrémentale
``` bash
scalingo run --region osc-secnum-fr1 -a pix-datawarehouse-production --size M --detached node ./src/run-replicate-incrementally.js
```

#### Sur la BDD destinée aux externes
Lancer la réplication par dump
``` bash
scalingo run --region osc-secnum-fr1 -a pix-datawarehouse-ex-production --size M --detached node ./src/run.js
```

#### Exécution partielle
Dans certains cas, le besoin est de relancer uniquement les opérations de fin de réplication

##### Import AirTable
``` bash
node -e "steps=require('./src/steps'); steps.importAirtableData(require ('./src/extract-configuration-from-environment')())"
```

##### Enrichissement
Création index, vues..
``` bash
node -e "steps=require('./src/steps'); steps.addEnrichment(require ('./src/extract-configuration-from-environment')())"
```

## Développement et exécution en local

### Installation
Installez le dépôt 
``` bash
git clone git@github.com:1024pix/pix-db-replication.git && cd pix-db-replication
nvm use
npm run preinstall
```

Démarrer le serveur de BDD
````shell
docker-compose up --detach
````

Créer et chargers les BDD
````shell
npm run local:setup-databases
````

Vérifiez que la source et la cible sont accessibles et qu'elles contiennent des données
````shell
psql postgres://source_user@localhost/source_database
psql postgres://target_user@localhost/target_database
````

### Paramétrage
Créer un fichier `.env` à partir du fichier [sample.env](sample.env)

### Exécution

#### Réplication complète

Modifier le .env
``` bash
DATABASE_URL=postgresql://target_user@localhost/target_database
RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS=true
RESTORE_FK_CONSTRAINTS=true
RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY=false
``` 

Lancer la réplication
``` bash
node -e "steps=require('./src/steps'); steps.fullReplicationAndEnrichment(require ('./src/extract-configuration-from-environment')())"
```

Au bout de 5 minutes, vous devez obtenir le message
``` bash
"msg":"enrichment.add - Ended","time":"2021-01-08T08:26:13.000Z","v":0}
"msg":"Import and enrichment done","time":"2021-01-08T08:26:13.000Z","v":0}
``` 

Pensez à recréer le backup sur le filesystem local, supprimé par la restauration
``` bash
git checkout data/source.pgsql
```

#### Réplication incrémentale

##### Initialiser l'environnement

Supprimer les FK sortantes des tables à copier
``` bash
psql postgresql://target_user@localhost/target_database
```

```sql
ALTER TABLE answers DROP CONSTRAINT "answers_assessmentid_foreign";
ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_answerid_foreign";
ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_assessmentid_foreign";
ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_userid_foreign";
ALTER TABLE "knowledge-element-snapshots" DROP CONSTRAINT "knowledge_element_snapshots_userid_foreign";
ALTER TABLE "knowledge-element-snapshots" DROP CONSTRAINT "knowledge_element_snapshots_snappedat_foreign";
```

##### Paramétrer
Modifier le .env
``` bash
SOURCE_DATABASE_URL=postgresql://source_user@localhost/source_database
TARGET_DATABASE_URL=postgresql://target_user@localhost/target_database
RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS=true
RESTORE_FK_CONSTRAINTS=false
RESTORE_ANSWERS_AND_KES_AND_KE_SNAPSHOTS_INCREMENTALLY=true
``` 

##### Exécuter
Exécuter
``` bash
node ./src/run-replicate-incrementally.js 
```

## Tests
Une partie du code n'est pas testable de manière automatisée.
Elle consiste en la récupération du backup.
Il est donc important d'effectuer un test manuel en RA avant de merger une PR, même si la CI passe. 
 
### Manuels 

#### Local
Récupérer les données Airtable : 
``` bash
node -e "steps=require('./src/steps'); steps.importAirtableData();"
```

#### RA Scalingo
- Application Scalingo hors `osc-secnum-fr1` pour éviter les considérations de sécurité des données

- Vérifier les données présentes dans la BDD à exporter

``` bash
$ scalingo -a pix-api-review-pr1973 pgsql-console
```

- Lancer un backup (ou ne rien faire, le dernier est utilisé par défaut)

- Déterminer le nom de l'application, par exemple : `pix-datawarehouse-pr47`
``` bash
NOM_APPLICATION=pix-datawarehouse-pr47
```

- Lancer le process de création et d'import du backup
``` bash
scalingo run --region osc-fr1 --app pix-datawarehouse-pr<NUMERO-PR> --size S --detached node ./src/run.js
```

- Vérifier le résultat
``` bash
scalingo -a pix-datawarehouse-pr<NUMERO-PR> pgsql-console
```

```sql
SELECT id, email FROM "users" LIMIT 5;
```

### Automatisés

#### Local

##### Intégration
Déroulement : 
- une BDD est créée en local sur l'URL `$TEST_POSTGRES_URL` (par défaut : `postgres://postgres@localhost`), instance `pix_replication_test`
- la table `test_table` est créée et chargée avec 100 000 enregistrements (1 colonne, PK)
- un export est effectué par `pg_dump --c` dans un dossier temporaire 
- la restauration à tester est appelée depuis `steps.js/restoreBackup`
- les assertions SQL sont effectuées par un `runSql`, un wrapper autour de `psql` 

_Note :_ le dump Scalingo est créé avec des options `pg_dump` [différentes](https://doc.scalingo.com/databases/postgresql/dump-restore)

- Se connecter à la BDD de test : 
``` bash
psql postgres://postgres@localhost/pix_replication_test
```

#### CI
La CI exécute l'intégralité des tests (unitaire et intégration).

## Parser les logs
L'analyse de ce qui prend du temps est complexe sur les logs brutes s'il y a : 
- plusieurs jobs de restauration (variable d'environnement`PG_RESTORE_JOBS`)
- beaucoup de tables.

Pour faciliter l'analyse, utilisez le script d'analyse de log. 

Étapes :
* récupérer les logs 
``` bash
scalingo --region osc-secnum-fr1 --app <NOM_APPLICATION> logs --lines 100000 > logs.txt
```

* déterminer la date d'exécution au format `YYYY-MM-DDDD`, par exemple : `2020-10-13`

* exécuter 
``` bash
node utils/parse-replication-logs.js ./logs.txt <DATE_EXECUTION>
```

Exemples de résultat sur `pix-datawarehouse-production` le 22/10/2020 
```  bash
node utils/parse-replication-logs.js ./logs.txt 2020-10-22
```

```                                                                                                                                                                                        1 ↵
Durée de récupération du backup: 1h 27min 42s
Durée de réplication: 8h 51min 17s
Durée de l'enrichissement: 1h 39min 42s
Durée totale: 11h 58min 41s
FK CONSTRAINT total duration : 7h 57min 25s
	FK CONSTRAINT schooling-registrations students_organizationid_foreign : 2h 11min 4s
	FK CONSTRAINT competence-evaluations competence_evaluations_assessmentid_foreign : 2h 10min 41s
	FK CONSTRAINT knowledge-elements knowledge_elements_answerid_foreign : 0h 58min 52s
CONSTRAINT total duration : 2h 49min 60s
	CONSTRAINT answers answers_pkey : 1h 26min 32s
	CONSTRAINT knowledge-elements knowledge-elements_pkey : 1h 13min 36s
	CONSTRAINT knowledge-element-snapshots knowledge-element-snapshots_pkey : 0h 2min 59s
INDEX total duration : 10h 21min 34s
	INDEX knowledge-elements_assessmentId_idx : 4h 16min 55s
	INDEX knowledge_elements_userid_index : 3h 49min 46s
	INDEX answers_assessmentid_index : 2h 7min 20s
SEQUENCE total duration : 0h 0min 28s
	SEQUENCE SET assessments_id_seq : 0h 0min 4s
	SEQUENCE SET user-orga-settings_id_seq : 0h 0min 3s
	SEQUENCE SET assessment-results_id_seq : 0h 0min 3s
TABLE DATA total duration : 4h 8min 7s
	TABLE DATA knowledge-element-snapshots : 1h 51min 60s
	TABLE DATA knowledge-elements : 1h 11min 25s
	TABLE DATA answers : 0h 46min 55s
```

S'il y a eu : 
- plusieurs exécutions le même jour
- une exécution incomplète (pas de message `Start restore` ou `Restore done`)

Alors vous obtiendrez le message suivant `TypeError: Cannot read property '0' of null`
