# pix-db-replication Changelog

## v2.32.0 (08/08/2024)


### :building_construction: Tech
- [#257](https://github.com/1024pix/pix-db-replication/pull/257) [TECH] Nettoyage des données de l'enquête anti-spoil (PIX-13811).

### :arrow_up: Montée de version
- [#248](https://github.com/1024pix/pix-db-replication/pull/248) [BUMP] Update dependency postgres to v14.12.
- [#241](https://github.com/1024pix/pix-db-replication/pull/241) [BUMP] Update dependency redis to v7.2.4.

## v2.31.0 (18/06/2024)


### :rocket: Amélioration
- [#251](https://github.com/1024pix/pix-db-replication/pull/251) [FEATURE] Permettre d'ajouter une en-tête d'authorisation aux notifications (PIX-12873).

### :arrow_up: Montée de version
- [#244](https://github.com/1024pix/pix-db-replication/pull/244) [BUMP] Lock file maintenance (dossier racine).

## v2.30.0 (06/05/2024)


### :rocket: Amélioration
- [#245](https://github.com/1024pix/pix-db-replication/pull/245) [FEATURE] Remonter le champ "urlsToConsult" des épreuves dans la base de réplication (PIX-12440).

### :building_construction: Tech
- [#242](https://github.com/1024pix/pix-db-replication/pull/242) [TECH] Changer la configuration dépréciée auto-minor de renovate.

### :arrow_up: Montée de version
- [#243](https://github.com/1024pix/pix-db-replication/pull/243) [BUMP] Lock file maintenance (dossier racine).
- [#240](https://github.com/1024pix/pix-db-replication/pull/240) [BUMP] Lock file maintenance (dossier racine).
- [#234](https://github.com/1024pix/pix-db-replication/pull/234) [BUMP] Update dependency eslint to v9.
- [#217](https://github.com/1024pix/pix-db-replication/pull/217) [BUMP] Update dependency chai to v5 (dossier racine).

## v2.29.3 (18/04/2024)


### :bug: Correction
- [#239](https://github.com/1024pix/pix-db-replication/pull/239) [BUGFIX] Réparer le démarrage du worker .
- [#238](https://github.com/1024pix/pix-db-replication/pull/238) [BUGFIX] Réparer le lancement du worker.

## v2.29.2 (18/04/2024)


### :building_construction: Tech
- [#237](https://github.com/1024pix/pix-db-replication/pull/237) [TECH] Migrer de cjs à esm le projet.

## v2.29.1 (16/04/2024)


### :bug: Correction
- [#236](https://github.com/1024pix/pix-db-replication/pull/236) [BUGFIX] Mauvaise casse pour les champs "spoil" des acquis (PIX-12148).

### :arrow_up: Montée de version
- [#235](https://github.com/1024pix/pix-db-replication/pull/235) [BUMP] Update dependency eslint-plugin-n to v17 (dossier racine).
- [#233](https://github.com/1024pix/pix-db-replication/pull/233) [BUMP] Update dependency eslint-plugin-n to v16 (dossier racine).
- [#232](https://github.com/1024pix/pix-db-replication/pull/232) [BUMP] Update dependency eslint-plugin-n to v15 (dossier racine).

## v2.29.0 (15/04/2024)


### :rocket: Amélioration
- [#231](https://github.com/1024pix/pix-db-replication/pull/231) [FEATURE] Rajouter les champs spoil pour les acquis (PIX-11739).

### :arrow_up: Montée de version
- [#230](https://github.com/1024pix/pix-db-replication/pull/230) [BUMP] Replace dependency eslint-plugin-node with eslint-plugin-n ^14.0.0 (dossier racine).
- [#229](https://github.com/1024pix/pix-db-replication/pull/229) [BUMP] Lock file maintenance (dossier racine).

## v2.28.0 (14/03/2024)


### :building_construction: Tech
- [#228](https://github.com/1024pix/pix-db-replication/pull/228) [TECH] Ne plus exposer le champ déprécié "title" de la table "tubes" (PIX-11631).

### :bug: Correction
- [#219](https://github.com/1024pix/pix-db-replication/pull/219) [BUGFIX] :bug: Corriger le filtrage des tables lors de la restoration. (PIX-11598)

### :arrow_up: Montée de version
- [#226](https://github.com/1024pix/pix-db-replication/pull/226) [BUMP] Update dependency postgres to v14.11.
- [#227](https://github.com/1024pix/pix-db-replication/pull/227) [BUMP] Lock file maintenance (dossier racine).
- [#225](https://github.com/1024pix/pix-db-replication/pull/225) [BUMP] Lock file maintenance (dossier racine).
- [#224](https://github.com/1024pix/pix-db-replication/pull/224) [BUMP] Lock file maintenance (dossier racine).

## v2.27.0 (23/02/2024)


### :building_construction: Tech
- [#216](https://github.com/1024pix/pix-db-replication/pull/216) [TECH] Monter la version de l'image postgresql.

### :bug: Correction
- [#223](https://github.com/1024pix/pix-db-replication/pull/223) [BUGFIX] Ne supprimer que les enums du namespace "public".
- [#222](https://github.com/1024pix/pix-db-replication/pull/222) [BUGFIX] Corriger la réplication en supprimant les enums.

### :arrow_up: Montée de version
- [#221](https://github.com/1024pix/pix-db-replication/pull/221) [BUMP] Lock file maintenance (dossier racine).
- [#215](https://github.com/1024pix/pix-db-replication/pull/215) [BUMP] Lock file maintenance (dossier racine).
- [#220](https://github.com/1024pix/pix-db-replication/pull/220) [BUMP] Update dependency husky to v9 (dossier racine).
- [#218](https://github.com/1024pix/pix-db-replication/pull/218) [BUMP] Update dependency redis to v7.2.3.

## v2.26.0 (01/12/2023)


### :rocket: Amélioration
- [#214](https://github.com/1024pix/pix-db-replication/pull/214) [FEATURE] Ajout des champs `practicalTitle` et `practicalDescription` dans la table `tubes` (PIX-10202).

## v2.25.0 (16/11/2023)


### :building_construction: Tech
- [#213](https://github.com/1024pix/pix-db-replication/pull/213) [TECH] :sparkles: Supprimer les vues postgres avant de les réinsérer .

### :arrow_up: Montée de version
- [#210](https://github.com/1024pix/pix-db-replication/pull/210) [BUMP] Lock file maintenance (dossier racine).

## v2.24.0 (30/10/2023)


### :building_construction: Tech
- [#206](https://github.com/1024pix/pix-db-replication/pull/206) [TECH] Pouvoir configurer le delay sur le retry des jobs.

### :arrow_up: Montée de version
- [#209](https://github.com/1024pix/pix-db-replication/pull/209) [BUMP] Update dependency sinon to v17 (dossier racine).
- [#208](https://github.com/1024pix/pix-db-replication/pull/208) [BUMP] Update node to v20 (major).
- [#207](https://github.com/1024pix/pix-db-replication/pull/207) [BUMP] Lock file maintenance (dossier racine).
- [#202](https://github.com/1024pix/pix-db-replication/pull/202) [BUMP] Update dependency sinon to v16 (dossier racine).

## v2.23.0 (21/09/2023)


### :rocket: Amélioration
- [#203](https://github.com/1024pix/pix-db-replication/pull/203) [FEATURE] Ajout de champs dans la réplication des épreuves depuis LCMS (PIX-7820).

### :arrow_up: Montée de version
- [#201](https://github.com/1024pix/pix-db-replication/pull/201) [BUMP] Lock file maintenance (dossier racine).

## v2.22.0 (22/08/2023)


### :rocket: Amélioration
- [#197](https://github.com/1024pix/pix-db-replication/pull/197) [FEATURE] :sparkles: Ajout d'un cron pour exporter le schéma de données dans une base dédiée.

### :arrow_up: Montée de version
- [#199](https://github.com/1024pix/pix-db-replication/pull/199) [BUMP] Update node.
- [#198](https://github.com/1024pix/pix-db-replication/pull/198) [BUMP] Update redis Docker tag to v7.
- [#193](https://github.com/1024pix/pix-db-replication/pull/193) [BUMP] Lock file maintenance (dossier racine).

## v2.21.0 (31/07/2023)


### :building_construction: Tech
- [#190](https://github.com/1024pix/pix-db-replication/pull/190) [TECH] Supprimer les attributs inutilisés par Metabase de la table courses.
- [#188](https://github.com/1024pix/pix-db-replication/pull/188) [TECH] Utiliser la configuration auto-minor au lieu de la configuration aggressive.

### :arrow_up: Montée de version
- [#192](https://github.com/1024pix/pix-db-replication/pull/192) [BUMP] Lock file maintenance (dossier racine).
- [#191](https://github.com/1024pix/pix-db-replication/pull/191) [BUMP] Update postgres Docker tag to v14.8.
- [#189](https://github.com/1024pix/pix-db-replication/pull/189) [BUMP] Update node.
- [#183](https://github.com/1024pix/pix-db-replication/pull/183) [BUMP] Lock file maintenance (dossier racine).
- [#174](https://github.com/1024pix/pix-db-replication/pull/174) [BUMP] Lock file maintenance (dossier racine).
- [#168](https://github.com/1024pix/pix-db-replication/pull/168) [BUMP] Update postgres Docker tag to v14.7.
- [#166](https://github.com/1024pix/pix-db-replication/pull/166) [BUMP] Lock file maintenance.
- [#165](https://github.com/1024pix/pix-db-replication/pull/165) [BUMP] Update Node.js to v18.16.0.

## v2.20.0 (18/04/2023)


### :rocket: Amélioration
- [#162](https://github.com/1024pix/pix-db-replication/pull/162) [FEATURE] Fournir l'application appelante à LCMS (PIX-7751)

## v2.19.0 (30/03/2023)


### :building_construction: Tech
- [#160](https://github.com/1024pix/pix-db-replication/pull/160) [TECH] Refactorise quelques parties de la réplication

### :coffee: Autre
- [#159](https://github.com/1024pix/pix-db-replication/pull/159) [BUMP] Lock file maintenance

## v2.18.0 (23/03/2023)


### :building_construction: Tech
- [#143](https://github.com/1024pix/pix-db-replication/pull/143) [TECH] Nettoie et refactore l'aborescence

## v2.17.0 (23/03/2023)


### :building_construction: Tech
- [#156](https://github.com/1024pix/pix-db-replication/pull/156) [TECH] Corriger l'export des données CPF depuis l'open data
- [#142](https://github.com/1024pix/pix-db-replication/pull/142) [TECH] Ajout de renovate

### :coffee: Autre
- [#148](https://github.com/1024pix/pix-db-replication/pull/148) [BUMP] Update redis Docker tag to v6.2
- [#149](https://github.com/1024pix/pix-db-replication/pull/149) [BUMP] Update Node.js to v18

## v2.16.0 (20/03/2023)


### :building_construction: Tech
- [#140](https://github.com/1024pix/pix-db-replication/pull/140) [TECH] Mise à jour des dépendances
- [#139](https://github.com/1024pix/pix-db-replication/pull/139) [TECH] Mise à jour vers node 18

### :bug: Correction
- [#141](https://github.com/1024pix/pix-db-replication/pull/141) [BUGFIX] Corrige le timeout de axios avec un signal

## v2.15.1 (17/03/2023)


### :building_construction: Tech
- [#138](https://github.com/1024pix/pix-db-replication/pull/138) [TECH] Générer un recordid unique à partir de plusieurs champs

## v2.15.0 (15/03/2023)


### :coffee: Autre
- [#137](https://github.com/1024pix/pix-db-replication/pull/137) :sparkles: Fetch CPF formations list from open data

## v2.14.0 (24/02/2023)


### :rocket: Amélioration
- [#136](https://github.com/1024pix/pix-db-replication/pull/136) [FEATURE] Ajouter des champs aux épreuves récupérés depuis LCMS 

### :bug: Correction
- [#134](https://github.com/1024pix/pix-db-replication/pull/134) [BUGFIX] Rajout d'un timeout sur la requête LCMS

## v2.13.0 (24/02/2023)


### :rocket: Amélioration
- [#132](https://github.com/1024pix/pix-db-replication/pull/132) [FEATURE] Mise a jour de la version par défaut de pg
- [#135](https://github.com/1024pix/pix-db-replication/pull/135) [FEATURE] Importer les données de LCMS par groupe de 2000 et table par table

## v2.12.0 (22/02/2023)


### :bug: Correction
- [#133](https://github.com/1024pix/pix-db-replication/pull/133) [BUGFIX] Revert du rajout des champs dans les épreuves

## v2.11.0 (21/02/2023)


### :building_construction: Tech
- [#129](https://github.com/1024pix/pix-db-replication/pull/129) [TECH] Ajouter des champs aux épreuves récupérés depuis LCMS (PIX-7110).

## v2.10.1 (21/02/2023)


### :bug: Correction
- [#130](https://github.com/1024pix/pix-db-replication/pull/130) [BUGFIX] Correction de l'extraction de l'attribut name des compétences

## v2.10.0 (01/02/2023)


### :coffee: Autre
- [#126](https://github.com/1024pix/pix-db-replication/pull/126) Monter la version de PG de 13 à 14

## v2.9.0 (23/01/2023)


### :coffee: Autre
- [#128](https://github.com/1024pix/pix-db-replication/pull/128) Revert "Revert "[TECH] Met à jour la facon de récupérer le titre fr d'une compétence""

## v2.8.0 (23/01/2023)


### :coffee: Autre
- [#127](https://github.com/1024pix/pix-db-replication/pull/127) Revert "[TECH] Met à jour la facon de récupérer le titre fr d'une compétence"

## v2.7.0 (20/01/2023)


### :building_construction: Tech
- [#125](https://github.com/1024pix/pix-db-replication/pull/125) [TECH] Met à jour la facon de récupérer le titre fr d'une compétence

## v2.6.0 (05/12/2022)


### :building_construction: Tech
- [#124](https://github.com/1024pix/pix-db-replication/pull/124) [TECH] Renommer indices en indexes

### :coffee: Autre
- [#123](https://github.com/1024pix/pix-db-replication/pull/123) [CLEANUP] Remove some wording that doesn't apply anymore

## v2.5.0 (26/10/2022)


### :building_construction: Tech
- [#121](https://github.com/1024pix/pix-db-replication/pull/121) [TECH] Améliorer la gestion des données du référentiel vides
- [#120](https://github.com/1024pix/pix-db-replication/pull/120) [TECH] Lancer l'import LCMS en local
- [#119](https://github.com/1024pix/pix-db-replication/pull/119) [TECH] Faciliter la résolution de problèmes

## v2.4.0 (10/10/2022)


### :rocket: Amélioration
- [#116](https://github.com/1024pix/pix-db-replication/pull/116) [FEATURE] Ajout d'une licence

### :building_construction: Tech
- [#112](https://github.com/1024pix/pix-db-replication/pull/112) [TECH] Améliorer la tracabilité des métriques de la réplication incrémentale pour une meilleure exploitation dans Datadog

### :bug: Correction
- [#115](https://github.com/1024pix/pix-db-replication/pull/115) [BUGFIX] Ne pas exclure le schema pgboss lors du backup

### :coffee: Autre
- [#117](https://github.com/1024pix/pix-db-replication/pull/117) [DOC] Supprimer le flag --detached de la relance manuelle
- [#118](https://github.com/1024pix/pix-db-replication/pull/118) [CLEANUP] Utilise l'action auto merge commune
- [#113](https://github.com/1024pix/pix-db-replication/pull/113) [Documentation] Fix typo readme

## v2.3.0 (04/07/2022)


### :building_construction: Tech
- [#114](https://github.com/1024pix/pix-db-replication/pull/114) [TECH] Exclure le schéma pgboss du dump de la réplication.

## v2.2.0 (20/06/2022)


### :rocket: Amélioration
- [#110](https://github.com/1024pix/pix-db-replication/pull/110) [FEATURE] Ajout d'une notification / webhook en fin de réplication

### :coffee: Autre
- [#111](https://github.com/1024pix/pix-db-replication/pull/111) [CLEANUP] Supprimer la réplication incrémentale par CronJob obsolète.
- [#109](https://github.com/1024pix/pix-db-replication/pull/109) [CLEANUP] Renomme un script 

## v2.1.0 (18/03/2022)


### :building_construction: Tech
- [#108](https://github.com/1024pix/pix-db-replication/pull/108) [TECH] Ajouter une vue pour la table schooling registrations (PIX-4491).

### :coffee: Autre
- [#107](https://github.com/1024pix/pix-db-replication/pull/107) [CLEANUP] Renommage d'une variable pour plus de clarté

## v2.0.2 (01/03/2022)


### :rocket: Amélioration
- [#106](https://github.com/1024pix/pix-db-replication/pull/106) [FEATURE] Mise a jour de la réplication de la relation challenge -> skill 

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

