# Récupération de données externes depuis de l'open data

Le dossier `cpf` de ce projet contient un script qui permet d'insérer des données de l'api de la caisse des dépots
dans une table de la BDD.

## Fonctionnement

Le script télécharge un json contenant les entrées de l'API de la caisse des dépots,
récupère les entrées désirées et génère un identifiant propre à chaque formation.
Il insère ensuite ces données dans un fichier CSV, qu'il insère dans la BDD via la commande
`\copy`.

> **Warning**
>
> L'URL actuelle ne requête que 2000 résultats maximum, il conviendra de surveiller que nous ne dépassons pas ce nombre de rows

## Pour tester en local

Démarrer la BDD PG configurée dans `docker-compose.yml`

```bash
docker-compose up -d
```

Lancer le script de récupération des données

```bash
./scripts/fetch-cpf-formations.sh
```

Vérifier que des données sont bien insérées

```bash
docker exec database-cpf-export-local psql -U postgres -d postgres -c "select * from external_opendata_caisse_des_depots_cpf_list LIMIT 1"
```
