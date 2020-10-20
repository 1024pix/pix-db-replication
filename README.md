# Application de datawarehouse Pix

Ce projet a pour but de mettre à disposition
- des utilisateurs internes (développeurs, PO, support, métiers)
- des utilisateurs externes (partenaires, membres d'une organisation dans PixOrga)
les possibilités suivantes:
- exécuter des rapports dans Metabase
- exécuter des requêtes SQL 

Les contraintes majeures sont:
- disposer des données les plus récentes
- ne pas impacter la performance de la BDD
- ne donner accès qu'aux utilisateurs autorisés.

La solution est la suivante:
- importer chaque nuit les données de production complète dans une BDD dite "interne"
- importer chaque nuit une partie des données de production dans une BDD dite "externe"
- dans Metabase, ne donner accès aux externes que sur cette BDD "externe"
- suite à l'import, créer des objets supplémentaires pour assurer un temps d'exécution des rapport acceptables (index, vues matérialisées,..) 

Pour importer les données, récupérer le backup créé automatiquement par Scalingo.
Afin de garder un seul repository partagé par les applications, utiliser les variables d'environnement. 

## Pré-requis

Ce projet est prévu pour être déployé sur une application Scalingo associée à
une base de donnée PostgreSQL.

## Déploiement application

Pour satisfaire les contraintes de déploiement Scalingo, le `Procfile` déclare un conteneur de type `web` qui démarre un serveur Web "vide".
 
Une fois l'application créée et déployée une première fois, il faut: 
- mettre à 0 le nombre de conteneurs de type `web` 
- mettre à 1 le nombre de conteneurs de type `background`.

## Paramétrage

Variables d'environnement :

 * `SCALINGO_APP` : cette variable est utilisée automatiquement par l'outil CLI de Scalingo, et doit contenir le nom de l'application portant la base de données _source_ (`pix-api-production` typiquement).

 * `SCALINGO_API_TOKEN` : cette variable est utilisée automatiquement par l'outil CLI de Scalingo pour l'authentification, et doit être renseignée avec un _token_ d'utilisateur Scalingo étant collaborateur de l'application désignée par `SCALINGO_APP`.

 * `SCHEDULE` : une chaîne au format `cron` (interprétée par https://www.npmjs.com/package/node-cron) qui spécifie la fréquence à laquelle l'opération de réplication doit être exécutée. Exemple : `10 5 * * *` correspond à une exécution quotidienne à 5h10 UTC.

 * `DATABASE_URL` : URL d'accès à la base _cible_ qui sera écrasée et alimentée depuis le _backup_ à chaque exécution. Cette variable est en principe automatiquement alimentée par Scalingo lors de l'ajout d'une base PostgreSQL.

 * `MAX_RETRY_COUNT` : cette variable est utilisée pour indiquer le nombre maximum de tentative de rejeux

 * `RESTORE_FK_CONSTRAINTS` : restaurer ou non les contraintes de clés étrangères. Si non renseignée, les contraintes de clés étrangères ne sont pas restaurées. Si "true", les contraintes de clés étrangères sont restaurées.

 * `RESTORE_ANSWERS_AND_KES` : restaurer ou non les tables `answers` et `knowledge-elements`. Si non renseignée, ces tables ne sont pas restaurées. Si "true", ces tables sont restaurées.


## Exécution hors tâche planifiée

Une opération de réplication peut être lancée immédiatement (hors tâche planifiée) en exécutant le script `run.js` dans un conteneur individuel Scalingo :

Sur la BDD destinée aux internes
    $ scalingo run --region osc-secnum-fr1 -a pix-datawarehouse-production --size M --detached node run.js

Sur la BDD destinée aux externes
    $ scalingo run --region osc-secnum-fr1 -a pix-datawarehouse-ex-production --size M --detached node run.js
    
## Développement et exécution en local

Certaines étapes de la procédure de réplication sont spécifiques à l'environnement Scalingo et pas pertinentes à exécuter en local lors du développement sur le script. 
Un exemple d'exécution d'une partie des étapes, en supposant un _backup_ déjà téléchargé et un serveur PostgreSQL disponible en local:

    $ DATABASE_URL=postgres://postgres@localhost/pix_restore node -e "steps=require('./steps'); steps.dropCurrentObjects(); steps.restoreBackup({compressedBackup:'backup.tar.gz'})"

## Tests

### Manuels sur Scalingo

Application Scalingo hors osc-secnum-fr1 pour éviter les considérations de sécurité des données 

Vérifier les données présentes dans la BDD à exporter
$ scalingo -a pix-api-review-pr1973 pgsql-console

Lancer un backup (ou ne rien faire, le dernier est utilisé par défaut)

Lancer l'import du backup 
$ scalingo run --region osc-fr1 --app pix-db-replication --size S --detached node run.js

Vérifier le résultat
$ scalingo -a pix-db-replication pgsql-console
`SELECT id, email FROM "users" LIMIT 5;`

### Automatisés

#### Intégration
 
Déroulement : 
- une BDD est créé en local sur l'URL $TEST_POSTGRES_URL (défaut: `postgres://postgres@localhost`), instance `pix_replication_test`
- la table `test_table` est créée et chargée avec 100 000 enregistrements (1 colonne, PK)
- un export est effectué par `pg_dump --c` dans un dossier temporaire 
- la restauration à tester est appelée depuis steps.js/restoreBackup
- les assertions SQL sont effectuées par un `runSql`, un wrapper autour de `psql` 

Note: le dump Scalingo est créé avec des options `pg_dump` [différentes](https://doc.scalingo.com/databases/postgresql/dump-restore)

Se connecter à la BDD de test 
```psql postgres://postgres@localhost/pix_replication_test```

Les tests d'intégration sortent en erreur sur CircleCI avec le message suivant 
`Error: spawn psql ENOENT`
