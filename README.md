# Réplication de la base de données Pix

Ce projet a pour but d'automatiser la réplication de la base de données de
production de Pix via les sauvegardes automatiques de Scalingo.

## Utilisation

Ce projet est prévu pour être déployé sur une application Scalingo associée à
une base de donnée PostgreSQL.

### Conteneurs

Pour satisfaire les contraintes de déploiement Scalingo, le `Procfile` déclare un conteneur de type `web` qui démarre un serveur Web "vide". Une fois l'application créée et déployée une première fois, il faut mettre à 0 le nombre de conteneurs de type `web` sur l'application Scalingo, et à 1 le nombre de conteneurs de type `background`.

### Environnement

 * `SCALINGO_APP`: cette variable est utilisée automatiquement par l'outil CLI de Scalingo, et doit contenir le nom de l'application portant la base de données _source_ (`pix-api-production` typiquement).

 * `SCALINGO_API_TOKEN`: cette variable est utilisée automatiquement par l'outil CLI de Scalingo pour l'authentification, et doit être renseignée avec un _token_ d'utilisateur Scalingo étant collaborateur de l'application désignée par `SCALINGO_APP`.

 * `SCHEDULE`: une chaîne au format `cron` (interprétée par https://www.npmjs.com/package/node-cron) qui spécifie la fréquence à laquelle l'opération de réplication doit être exécutée. Exemple : `10 5 * * *` correspond à une exécution quotidienne à 5h10 UTC.

  * `DATABASE_URL`: URL d'accès à la base _cible_ qui sera écrasée et alimentée depuis le _backup_ à chaque exécution. Cette variable est en principe automatiquement alimentée par Scalingo lors de l'ajout d'une base PostgreSQL.

### Exécution individuelle

En cas de besoin, une opération de réplication peut être lancée immédiatement en exécutant le script `run.js` dans un conteneur individuel Scalingo :

    $ scalingo run -a pix-production-db-replication node run.js

## Développement et exécution en local

Certaines étapes de la procédure de réplication sont spécifiques à l'environnement Scalingo et pas pertinentes à exécuter en local lors du développement sur le script. Un exemple d'exécution d'une partie des étapes, en supposant un _backup_ déjà téléchargé et un serveur PostgreSQL disponible en local:

    $ DATABASE_URL=postgres://postgres@localhost/pix_restore node -e "steps=require('./steps'); steps.dropCurrentObjects(); steps.restoreBackup({compressedBackup:'backup.tar.gz'})"
