
# Déploiement des Edge Functions avec JWT désactivé

## Commandes de déploiement

### Prérequis

```bash
# Installer la CLI Supabase (si ce n'est pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet local au projet distant
supabase link --project-ref drxtaxepofuoelplgrei
```

### Méthode 1 : Déployer toutes les fonctions (RECOMMANDÉ)

Cette méthode déploie toutes les fonctions en utilisant la configuration du fichier `supabase/config.toml` :

```bash
# S'assurer que config.toml contient la configuration JWT
# Voir EDGE_FUNCTIONS_JWT_FIX.md pour le contenu

# Déployer toutes les fonctions
supabase functions deploy
```

### Méthode 2 : Déployer les fonctions individuellement

Si vous préférez déployer les fonctions une par une :

```bash
# Fonctions appelées par des triggers (JWT désactivé)
supabase functions deploy on-ride-created
supabase functions deploy on-reservation-requested
supabase functions deploy on-reservation-status-changed
supabase functions deploy on-ride-status-changed
supabase functions deploy on-driver-arrived
supabase functions deploy on-ride-reminders
supabase functions deploy on-rating-request
```

### Méthode 3 : Utiliser le flag --no-verify-jwt (Alternative)

Si vous ne voulez pas utiliser `config.toml`, vous pouvez passer le flag directement :

```bash
supabase functions deploy on-ride-created --no-verify-jwt
supabase functions deploy on-reservation-requested --no-verify-jwt
supabase functions deploy on-reservation-status-changed --no-verify-jwt
supabase functions deploy on-ride-status-changed --no-verify-jwt
supabase functions deploy on-driver-arrived --no-verify-jwt
supabase functions deploy on-ride-reminders --no-verify-jwt
supabase functions deploy on-rating-request --no-verify-jwt
```

⚠️ **Note** : Cette méthode nécessite de passer le flag à chaque déploiement. Il est préférable d'utiliser `config.toml` pour une configuration permanente.

## Vérification du déploiement

### Via la CLI

```bash
# Lister toutes les fonctions
supabase functions list

# Voir les détails d'une fonction
supabase functions inspect on-ride-created
```

### Via le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Cliquez sur **Edge Functions** dans le menu de gauche
3. Cliquez sur une fonction (ex: `on-ride-created`)
4. Vérifiez que **JWT Verification** est **Disabled**

### Tester une fonction

```bash
# Tester localement (sans JWT)
supabase functions serve on-ride-created --no-verify-jwt

# Dans un autre terminal, envoyer une requête de test
curl -X POST http://localhost:54321/functions/v1/on-ride-created \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "test-123",
    "driverId": "test-driver",
    "origin": "Dakar",
    "destination": "Thiès",
    "dateDeparture": "2024-02-01",
    "timeDeparture": "08:00",
    "price": 2000,
    "seatsAvailable": 3
  }'
```

## Logs et Debugging

### Voir les logs en temps réel

```bash
# Logs d'une fonction spécifique
supabase functions logs on-ride-created --follow

# Logs de toutes les fonctions
supabase functions logs --follow
```

### Via le Dashboard

1. **Edge Functions** → Sélectionner la fonction
2. Onglet **Logs** pour voir l'historique
3. Onglet **Invocations** pour voir les appels récents

## Rollback en cas de problème

Si le déploiement cause des problèmes :

```bash
# Revenir à la version précédente
supabase functions deploy on-ride-created --version <previous-version-number>
```

Vous pouvez voir les versions précédentes dans le Dashboard Supabase sous **Edge Functions** → **Versions**.

## CI/CD (Optionnel)

Pour automatiser le déploiement via GitHub Actions :

```yaml
name: Deploy Edge Functions

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy functions
        run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: drxtaxepofuoelplgrei
```

## Troubleshooting

### Erreur : "Project not linked"

```bash
supabase link --project-ref drxtaxepofuoelplgrei
```

### Erreur : "Docker not running"

La CLI peut déployer sans Docker en utilisant l'API :

```bash
supabase functions deploy --use-api
```

### Erreur : "verify_jwt still true after deployment"

Vérifiez que :
1. Le fichier `supabase/config.toml` existe et contient la configuration
2. Vous êtes dans le bon répertoire (racine du projet)
3. Vous avez bien redéployé après avoir modifié `config.toml`

### Les invocations retournent toujours 401

1. Vérifiez dans le Dashboard que JWT Verification est bien désactivé
2. Vérifiez les logs de la fonction pour voir si elle s'exécute
3. Vérifiez que le trigger Postgres appelle bien la bonne URL

## Prochaines étapes

Après le déploiement :

1. ✅ Tester la création d'un trajet pour vérifier que le trigger fonctionne
2. ✅ Vérifier les logs dans **Edge Functions** → **Invocations**
3. ✅ Confirmer que les notifications sont bien envoyées
4. ✅ Tester tous les scénarios de notifications (voir TESTING_GUIDE.md)
