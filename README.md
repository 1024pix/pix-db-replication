# Réplication des données de production de Pix

Ce projet a pour but de répliquer tout ou une partie des données d'une base de données postgreSQL:

- via une sauvegarde / restauration
- d'une manière incrémentale

Des enrichissements peuvent être fait à la fin de l'import.

Les données de pix-editor/lcms sont également répliquées.

A la fin du processus, nous notifions par webhooks des systèmes externes.

Ces étapes se font dans l'ordre et sont executées sequentiellement dans des jobs [bull](https://github.com/OptimalBits/bull).

## Pré-requis

Ce projet est prévu pour être déployé sur une application Scalingo associée à une base de donnée PostgreSQL.

Des variables d'environnement sont mises en place afin de garder un seul repository partagé par les applications.

## Utilisation sur Scalingo

### Installation

Alimenter les variables d'environnement documentées dans le fichier [sample.env](sample.env)

Pour satisfaire les contraintes de déploiement Scalingo, le [Procfile](Procfile) déclare un conteneur de type `web` qui démarre un serveur Web "vide".

Une fois l'application créée et déployée une première fois, il faut :
- mettre à 0 le nombre de conteneurs de type `web`
- mettre à 1 le nombre de conteneurs de type `background`
 
### Résolution de problèmes

#### Analyse de la cause

Connectez-vous à `bull`

```bash
scalingo --region osc-secnum-fr1 --app pix-datawarehouse-production run bull-repl
connect --uri #valeur de REDIS_URL# "Replication queue"
#connect "Incremental replication queue"
#connect "Learning Content replication queue"
failed
stats
```

Alternativement, se connecter à `redis`

```bash
scalingo --region osc-secnum-fr1 --app pix-datawarehouse-production redis-console
KEYS *
GET <KEY>
```

En local,

```bash
docker exec -it pix-db-replication-redis-1 redis-cli
```

#### Relance

Une fois que la cause du problème a été corrigée:

- s'il est important que les données soient disponibles le jour même, il est possible de lancer le traitement manuellement
- sinon ne rien faire, le traitement sera exécuté la nuit prochaine

> 🧨 Le traitement peut avoir des impacts sur les temps de réponses des applications, car il utilise les ressources BDD.
> Monitorez le % CPU BDD et le temps de réponse des requêtes HTTP pour arrêter le traitement si besoin. Pour cela, stopper le conteneur `background`.

Si la sauvegarde/restauration/enrichissement a échoué :

``` bash
npm run restart:full-replication
```

Si la réplication incrémentale a échoué :

``` bash
npm run restart:incremental-replication
```

Si la réplication de LCMS a échoué :

``` bash
npm run restart:learning-content-replication
```

Si les notifications de fin ont échoué :

``` bash
npm run restart:notification
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

````bash
docker-compose up --detach
````

Créer et charger les BDD

````bash
npm run local:setup-databases
````

Vérifiez que la source et la cible sont accessibles et qu'elles contiennent des données

````bash
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
BACKUP_MODE={}
RESTORE_FK_CONSTRAINTS=true
```

Lancer la réplication

``` bash
node -e "require('./src/steps/backup-restore').run(require ('./src/config/extract-configuration-from-environment')())"
```

Au bout de 5 minutes, vous devez obtenir le message

``` json
{"msg":"enrichment.add - Ended","time":"2021-01-08T08:26:13.000Z","v":0}
{"msg":"Import and enrichment done","time":"2021-01-08T08:26:13.000Z","v":0}
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
```

##### Paramétrer

Modifier le .env

``` bash
SOURCE_DATABASE_URL=postgresql://source_user@localhost/source_database
TARGET_DATABASE_URL=postgresql://target_user@localhost/target_database
BACKUP_MODE='{"knowledge-elements":"incremental", "knowledge-element-snapshots":"incremental","answers":"incremental"}'
RESTORE_FK_CONSTRAINTS=false
```

#### Ordonnanceur

Il est possible de faire tourner l'ordonnanceur en local.

Mettez la planification à toutes les minutes dans le fichier `.env`

`SCHEDULE=* * * * *`

Démarrez l'ordonnanceur

`node ./src/main.js | ./node_modules/.bin/bunyan`

Vérifiez que le traitement se lance

```bash
[2021-06-11T14:11:01.944Z]  INFO: pix-db-replication/83294 on OCTO-TOPI: Starting job in Learning Content replication queue: 10
```

Vérifiez que bull a pu joindre redis

```bash
redis-cli
keys bull:*
```

Connectez-vous au CLI Bull pour suivre l'avancement (`bull-repl`).

En local :

```bash
npx bull-repl
```

Pour se connecter via Scalingo, utiliser le connect avec les 4 options ci-dessous.

``` bash
connect [options] <queue>
    -h, --host <host>      Redis host for connection
    -p, --port <port>      Redis port for connection
    -d, --db <db>          Redis db for connection
    --password <password>  Redis password for connection
```

Puis saisir le nom de la queue.

Pour la réplication par dump

```bash
bull-repl
connect "Replication queue"
stats
```

Pour la réplication incrémentale

```bash
bull-repl
connect "Incremental replication queue"
stats
```

Pour l'import LCMS

```bash
bull-repl
connect "Learning Content replication queue"
stats
```

Vous obtenez, par exemple
- en cours d'exécution d'un traitement
- après 14 exécutions avec succès

```bash
┌───────────┬────────┐
│  (index)  │ Values │
├───────────┼────────┤
│  waiting  │   0    │
│  active   │   1    │
│ completed │   14   │
│  failed   │   0    │
│  delayed  │   0    │
│  paused   │   0    │
└───────────┴────────┘
```


## Tests

Une partie du code n'est pas testable de manière automatisée.

Il est donc important d'effectuer un test manuel en RA avant de merger une PR, même si la CI passe.

### Manuels

#### Local

Récupérer les données de LCMS :

``` bash
node -e "require('./src/steps/learning-content').run(require ('./src/config/extract-configuration-from-environment')())"
```

#### RA Scalingo

- Faire un backup des données d'une application Scalingo hors `osc-secnum-fr1`
pour éviter les considérations de sécurité des données

- Vérifier les données présentes dans la BDD à exporter (exemple pour les données d'une review app)

``` bash
scalingo -a pix-api-review-prxxx pgsql-console
```

- Lancer un backup (ou ne rien faire, le dernier est utilisé par défaut)

- Déterminer le nom de l'application de RA Scalingo de db-replication

``` bash
NOM_APPLICATION=pix-datawarehouse-pr<NUMERO-PR>
```

- Lancer le process de création et d'import du backup sur cette RA

``` bash
scalingo run --region osc-fr1 --app $NOM_APPLICATION npm run restart:full-replication
```

- Vérifier le résultat dans la bdd répliquée

``` bash
scalingo -a $NOM_APPLICATION pgsql-console
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

> le dump Scalingo est créé avec des options `pg_dump` [différentes](https://doc.scalingo.com/databases/postgresql/dump-restore)

- Se connecter à la BDD de test :

``` bash
psql postgres://postgres@localhost/pix_replication_test
```

#### CI

La CI exécute l'intégralité des tests (unitaire et intégration).

## Parser les logs

### Datadog

Les logs en production sont parsés sur Datadog, et l'ensemble des éléments remontent dans des logs structurés.
Il est ainsi possible de filtrer sur les status des logs pour obtenir les informations désirées.

### A la main

L'analyse de ce qui prend du temps est complexe sur les logs brutes s'il y a :

- plusieurs jobs de restauration (variable d'environnement`PG_RESTORE_JOBS`)
- beaucoup de tables.

Pour faciliter l'analyse, utilisez le script d'analyse de log.

Étapes :

- récupérer les logs

```bash
scalingo --region osc-secnum-fr1 --app <NOM_APPLICATION> logs --lines 100000 > /tmp/logs.txt
```

- déterminer la date d'exécution au format `YYYY-MM-DDDD`, par exemple : `2020-10-13`

- exécuter

```bash
node utils/parse-replication-logs.js ./logs.txt <DATE_EXECUTION>
```

Exemples de résultat sur `pix-datawarehouse-production` le 26/01/2025

```bash
node utils/parse-replication-logs.js ./logs.txt 2020-10-22
```

```1 ↵
# Dans le fichier /tmp/pix-datawarehouse-ex-production-logs.txt
Durée de création du backup: 0h 50min 20s
Durée du drop des tables: 0h 0min 2s
Durée de la création des vues: 0h 0min 0s
Durée de l'enrichissement: 0h 0min 19s
Durée de la mise à jour des authentication-methods: NaNh NaNmin NaNs
Durée du restore: 1h 44min 60s
Durée de l'incrémentale: 0h 2min 30s
Durée du Learning Content: 0h 1min 38s
Durée totale: 2h 39min 49s
```

S'il y a eu :

- plusieurs exécutions le même jour
- une exécution incomplète (pas de message `Start restore` ou `Restore done`)

Alors vous obtiendrez le message suivant `TypeError: Cannot read property '0' of null`

## Duplication des schémas uniquement

Afin de pouvoir alimenter une base de données contenant uniquement le schéma de BDD, notamment pour des besoins de Data Catalog,
le script `db-schema-exporter.sh` peut être utilisé.

En définissant les variables suivantes :

```bash
DB_SCHEMA_EXPORTER_ENABLED=true
DB_SCHEMA_EXPORTER_DATABASE_TARGET=postgres://user:password@database:port/db
```

Tous les jours à midi, le schéma de la base actuelle sera dupliqué sur la BDD distante.
