# Réplication de la base de données Pix

Ce projet a pour but d'automatiser la réplication de la base de données de
production de Pix via les sauvegardes automatiques de Scalingo.

## Utilisation

Ce projet est prévu pour être déployé sur une application Scalingo associée à
une base de donnée PostgreSQL.

### Conteneurs

Pour satisfaire les contraintes de déploiement Scalingo, le `Procfile` déclare
un conteneur de type `web` qui démarre un serveur Web "vide". Une fois
l'application créée et déployée une première fois, il faut mettre à 0 le nombre
de conteneurs de type `web` sur l'application Scalingo, et à 1 le nombre de
conteneurs de type `background`.

### Environnement

 * `SCALINGO_APP` : cette variable est utilisée automatiquement par l'outil CLI
   de Scalingo, et doit contenir le nom de l'application portant la base de
   données _source_ (`pix-api-production` typiquement).

 * `SCALINGO_REGION` : cette variable est utilisée automatiquement par l'outil
   CLI de Scalingo, et peut être utilisée si l'application source désignée par
   `SCALINGO_APP` n'est pas dans la région Scalingo par défaut.

 * `SCALINGO_API_TOKEN` : cette variable est utilisée automatiquement par
   l'outil CLI de Scalingo pour l'authentification, et doit être renseignée
   avec un _token_ d'utilisateur Scalingo étant collaborateur de l'application
   désignée par `SCALINGO_APP`.

 * `SCHEDULE` : une chaîne au format `cron` (interprétée par
   https://www.npmjs.com/package/node-cron) qui spécifie la fréquence à
   laquelle l'opération de réplication doit être exécutée. Exemple : `10 5 * *
   *` correspond à une exécution quotidienne à 5h10 UTC.

 * `DATABASE_URL` : URL d'accès à la base _cible_ qui sera écrasée et alimentée
   depuis le _backup_ à chaque exécution. Cette variable est en principe
   automatiquement alimentée par Scalingo lors de l'ajout d'une base
   PostgreSQL.

 * `MAX_RETRY_COUNT` : cette variable est utilisée pour indiquer le nombre
   maximum de tentative de rejeu.

 * `USE_UNLOGGED_TABLES` : si cette variable contient `true` alors les tables
   restaurées depuis le backup seront marquées `UNLOGGED`, c'est-à-dire que
   leurs modifications (et celles de leurs index) ne seront pas journalisées
   dans le journal de transactions PostgreSQL (WAL). Ceci permet de gagner
   jusqu'à 40% de temps lors de la réplication, mais si le serveur PostgreSQL
   s'arrête inopinément, toutes les données des tables seront perdues et il
   faudra relancer une réplication.

### Exécution individuelle

En cas de besoin, une opération de réplication peut être lancée immédiatement
en exécutant le script `run.js` dans un conteneur individuel Scalingo :

    $ scalingo run --region osc-secnum-fr1 -a pix-production-db-replication --size S --detached node run.js

Attention, Scalingo ne fournit aujourd'hui aucun moyen d'arrêter un conteneur
lancé en mode détaché. Bien s'assurer avant de lancer une réplication qu'une
instance n'est pas déjà en train de tourner.

## Développement et exécution en local

Certaines étapes de la procédure de réplication sont spécifiques à
l'environnement Scalingo et pas pertinentes à exécuter en local lors du
développement sur le script. Un exemple d'exécution d'une partie des étapes, en
supposant un _backup_ déjà téléchargé et un serveur PostgreSQL disponible en
local:

    $ DATABASE_URL=postgres://postgres@localhost/pix_restore node -e "steps=require('./steps'); steps.dropCurrentObjects(); steps.restoreBackup({compressedBackup:'backup.tar.gz'})"
