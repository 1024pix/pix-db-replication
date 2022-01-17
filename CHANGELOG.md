# pix-db-replication Changelog

## v2.0.1 (17/01/2022)


### :rocket: Enhancement
- [#105](https://github.com/1024pix/pix-db-replication/pull/105) [FEATURE] Récupération des champs difficulté et discriminant de LCMS pour Metabase (PIX-4095).

## v2.0.0 (26/10/2021)


### :rocket: Enhancement
- [#103](https://github.com/1024pix/pix-db-replication/pull/103) [FEATURE] Récupérer le référentiel d'épreuves depuis LCMS.

### :building_construction: Tech
- [#102](https://github.com/1024pix/pix-db-replication/pull/102) [TECH] Monter les BDD de développement en version majeure 13.3 depuis la 12.4.

## v1.20.0 (12/10/2021)

- [#100](https://github.com/1024pix/pix-db-replication/pull/100) [TECH] Scripts pour démarrer la réplication
- [#101](https://github.com/1024pix/pix-db-replication/pull/101) [TECH] Utiliser la bonne colonne airtable pour le nom des compétences.

## v1.19.0 (18/08/2021)

- [#99](https://github.com/1024pix/pix-db-replication/pull/99) [FEATURE] Ajouts de colonnes sur Challenges.

## v1.18.0 (13/08/2021)

- [#96](https://github.com/1024pix/pix-db-replication/pull/96) [FEATURE] Importer des attributs du référentiel (acquis, épreuves, tutoriel) (PIX-2567).
- [#98](https://github.com/1024pix/pix-db-replication/pull/98) [BUGFIX] Exclure des tables lors de la réplication complète.
- [#97](https://github.com/1024pix/pix-db-replication/pull/97) [TECH] Gérer le choix des tables de réplication via une configuration externalisée.

## v1.17.0 (23/06/2021)

- [#95](https://github.com/1024pix/pix-db-replication/pull/95) [TECH] Prévenir la mention de comptes dans les logs.

## v1.16.0 (18/06/2021)

- [#93](https://github.com/1024pix/pix-db-replication/pull/93) [BUGFIX] Permettre le démarrage de l'ordonnanceur lors du premier déploiement.

## v1.15.0 (18/06/2021)

- [#88](https://github.com/1024pix/pix-db-replication/pull/88) [TECH] Permettre l'exécution de l'ordonnanceur en local.
- [#92](https://github.com/1024pix/pix-db-replication/pull/92) Réplication incrémentale en asynchrone

## v1.14.0 (17/06/2021)

- [#90](https://github.com/1024pix/pix-db-replication/pull/90) [FEATURE] Ajouter les ke snapshots à la réplication incrémentale
- [#91](https://github.com/1024pix/pix-db-replication/pull/91) [BUGFIX ] Corriger les logs sur la réplication incrémentale

## v1.13.0 (27/05/2021)

- [#81](https://github.com/1024pix/pix-db-replication/pull/81) [TECH] Pouvoir relancer un traitement interrompu avec la job queue Bull.

## v1.12.0 (16/03/2021)

- [#80](https://github.com/1024pix/pix-db-replication/pull/80) [TECH] Notifier les développeurs des erreurs d'exécution
- [#86](https://github.com/1024pix/pix-db-replication/pull/86) Mise à jour des credentials Airtable
- [#84](https://github.com/1024pix/pix-db-replication/pull/84) Remove trace
- [#83](https://github.com/1024pix/pix-db-replication/pull/83) :zap: Ajout de l'automerge

## v1.11.0 (10/02/2021)

- [#82](https://github.com/1024pix/pix-db-replication/pull/82) [TECH] Ajout de données supplémentaires provenant du référentiel pour exploitation contenus

## v1.10.0 (15/01/2021)

- [#79](https://github.com/1024pix/pix-db-replication/pull/79) [TECH] Implémenter correctement l'installation asynchrone du client de BDD 
- [#78](https://github.com/1024pix/pix-db-replication/pull/78) [TECH] Détailler et corriger les instructions de relance.

## v1.9.0 (15/01/2021)

- [#77](https://github.com/1024pix/pix-db-replication/pull/77) [TECH] Tracer l'origine des promesses rejetées.

## v1.8.0 (15/01/2021)

- [#74](https://github.com/1024pix/pix-db-replication/pull/74) Ajouter des tests d'acceptance
- [#73](https://github.com/1024pix/pix-db-replication/pull/73) Grouper le code de production dans un dossier dédié

## v1.7.0 (12/01/2021)

- [#75](https://github.com/1024pix/pix-db-replication/pull/75) [TECH]  Annule la non réplication des ke snapshots
- [#72](https://github.com/1024pix/pix-db-replication/pull/72) [TECH] Faciliter le développement en local en disposant d'une BDD alimentée.

## v1.6.0 (08/01/2021)

- [#65](https://github.com/1024pix/pix-db-replication/pull/65) Ne pas restaurer les snapshot de KE pour les internes

## v1.5.0 (07/01/2021)

- [#71](https://github.com/1024pix/pix-db-replication/pull/71) [TECH] Mettre à jour l'image docker de postgresql utilisée par la CI
- [#68](https://github.com/1024pix/pix-db-replication/pull/68) [TECH] Mise à jour des dépendances
- [#70](https://github.com/1024pix/pix-db-replication/pull/70) [TECH] Passer de node 14.15.0 à 14.15.4

## v1.4.0 (07/01/2021)

- [#69](https://github.com/1024pix/pix-db-replication/pull/69) [TECH] Supprimer les dépendances plus utilisées

## v1.3.0 (06/01/2021)

- [#67](https://github.com/1024pix/pix-db-replication/pull/67) Permettre la relance de l'enrichissement



## v1.2.0 (31/12/2020)

