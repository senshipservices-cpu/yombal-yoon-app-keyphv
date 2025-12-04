
# Index : Correction JWT Edge Functions

## 📋 Vue d'ensemble

Ce dossier contient tous les documents nécessaires pour corriger les erreurs 401 des Edge Functions appelées depuis les triggers Postgres.

## 🚨 Commencer ici

**Si vous voulez corriger le problème MAINTENANT** :
- 👉 **[ACTION_IMMEDIATE_JWT_FIX.md](./ACTION_IMMEDIATE_JWT_FIX.md)** - Guide rapide (15 minutes)

## 📚 Documentation complète

### 1. Guides principaux

| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| **[EDGE_FUNCTIONS_JWT_FIX.md](./EDGE_FUNCTIONS_JWT_FIX.md)** | Guide complet de la correction avec explications détaillées | 10 min |
| **[DEPLOY_EDGE_FUNCTIONS.md](./DEPLOY_EDGE_FUNCTIONS.md)** | Guide de déploiement avec toutes les commandes CLI | 8 min |
| **[RESUME_FIX_JWT_EDGE_FUNCTIONS.md](./RESUME_FIX_JWT_EDGE_FUNCTIONS.md)** | Résumé exécutif de la correction | 5 min |

### 2. Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| **[supabase/config.toml.template](./supabase/config.toml.template)** | Template de configuration à copier dans `config.toml` |

### 3. Actions rapides

| Document | Description | Temps |
|----------|-------------|-------|
| **[ACTION_IMMEDIATE_JWT_FIX.md](./ACTION_IMMEDIATE_JWT_FIX.md)** | Checklist d'actions immédiates | 15 min |

## 🎯 Parcours recommandés

### Pour corriger rapidement (15 min)

1. ✅ Lire **ACTION_IMMEDIATE_JWT_FIX.md**
2. ✅ Mettre à jour `supabase/config.toml`
3. ✅ Exécuter `supabase functions deploy`
4. ✅ Tester dans l'application

### Pour comprendre en profondeur (30 min)

1. ✅ Lire **RESUME_FIX_JWT_EDGE_FUNCTIONS.md** (vue d'ensemble)
2. ✅ Lire **EDGE_FUNCTIONS_JWT_FIX.md** (détails techniques)
3. ✅ Lire **DEPLOY_EDGE_FUNCTIONS.md** (déploiement)
4. ✅ Appliquer la correction
5. ✅ Tester tous les scénarios

### Pour l'équipe DevOps (45 min)

1. ✅ Lire tous les documents ci-dessus
2. ✅ Comprendre les implications de sécurité
3. ✅ Mettre en place le monitoring
4. ✅ Configurer le CI/CD (optionnel)
5. ✅ Documenter les procédures internes

## 🔧 Problème et solution

### Problème

Les Edge Functions retournent **401 Unauthorized** lorsqu'elles sont appelées depuis les triggers Postgres car :
- Le runtime Supabase Edge nécessite un JWT valide par défaut
- Les triggers Postgres ne peuvent pas fournir un JWT valide
- Le runtime bloque la requête AVANT l'exécution du code

### Solution

Désactiver la vérification JWT pour les fonctions appelées par des triggers en ajoutant dans `supabase/config.toml` :

```toml
[functions.on-ride-created]
verify_jwt = false
```

Puis redéployer avec :

```bash
supabase functions deploy
```

## 📊 Fonctions concernées

### Fonctions avec JWT désactivé (7)

| Fonction | Trigger | Description |
|----------|---------|-------------|
| `on-ride-created` | `tg_on_ride_created` | Création de trajet |
| `on-reservation-requested` | `tg_on_reservation_requested` | Demande de réservation |
| `on-reservation-status-changed` | `tg_on_reservation_status_changed` | Changement statut réservation |
| `on-ride-status-changed` | `tg_on_ride_status_changed` | Changement statut trajet |
| `on-driver-arrived` | `tg_on_driver_arrived` | Arrivée conducteur |
| `on-ride-reminders` | Cron job | Rappels de trajet |
| `on-rating-request` | Cron job | Demande de notation |

### Fonctions avec JWT activé (3)

| Fonction | Appelée depuis | Description |
|----------|----------------|-------------|
| `send-notification-unified` | Autres Edge Functions | Envoi unifié de notifications |
| `google-places-proxy` | Application cliente | Proxy Google Places |
| `send-otp-twilio` | Application cliente | Envoi OTP |

## 🔒 Sécurité

### Risques

⚠️ Désactiver `verify_jwt` permet à n'importe qui d'appeler ces fonctions sans authentification.

### Mesures de sécurité en place

1. ✅ Fonctions appelées uniquement par triggers Postgres internes
2. ✅ Validation des données dans chaque fonction
3. ✅ Logs de toutes les invocations
4. ✅ Utilisation de `SUPABASE_SERVICE_ROLE_KEY`

### Recommandations

- Monitorer les logs pour détecter des appels suspects
- Implémenter un rate limiting si nécessaire
- Considérer l'ajout d'un secret partagé (voir EDGE_FUNCTIONS_JWT_FIX.md)

## 🧪 Tests

### Test rapide (3 min)

1. Créer un trajet dans l'application
2. Vérifier le statut 200 dans **Edge Functions** → **Invocations**
3. Vérifier la notification dans l'application

### Tests complets

Voir **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** pour tous les scénarios de test.

## 📈 Monitoring

### Logs en temps réel

```bash
supabase functions logs on-ride-created --follow
```

### Dashboard Supabase

1. **Edge Functions** → Sélectionner la fonction
2. Onglet **Invocations** - Voir les appels récents
3. Onglet **Logs** - Voir les logs détaillés

### Métriques à surveiller

- Taux de succès (200 vs 401/500)
- Temps d'exécution
- Nombre d'invocations par jour
- Erreurs récurrentes

## 🚀 Déploiement

### Commandes essentielles

```bash
# Configuration initiale
supabase login
supabase link --project-ref drxtaxepofuoelplgrei

# Déploiement
supabase functions deploy

# Vérification
supabase functions list
supabase functions logs on-ride-created --follow
```

### CI/CD

Voir **[DEPLOY_EDGE_FUNCTIONS.md](./DEPLOY_EDGE_FUNCTIONS.md)** section CI/CD pour automatiser le déploiement.

## 🆘 Troubleshooting

### Erreur : "supabase: command not found"

```bash
npm install -g supabase
```

### Erreur : "Project not linked"

```bash
supabase link --project-ref drxtaxepofuoelplgrei
```

### Erreur : JWT Verification toujours activé

1. Vérifier que `config.toml` est dans `supabase/config.toml`
2. Vérifier que vous êtes dans le bon répertoire
3. Redéployer avec le flag explicite : `--no-verify-jwt`

### Erreur : Toujours des 401

1. Vérifier dans le Dashboard que JWT Verification est désactivé
2. Vérifier les logs détaillés
3. Vérifier que le trigger appelle la bonne URL

## 📞 Support

### Ressources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Discord](https://discord.supabase.com)

### Documents connexes

- **[NOTIFICATIONS_SETUP.md](./NOTIFICATIONS_SETUP.md)** - Configuration des notifications
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guide de tests
- **[MONITORING_SETUP.sql](./MONITORING_SETUP.sql)** - Configuration du monitoring

## ✅ Checklist de validation

Après avoir appliqué la correction, vérifiez :

- [ ] `config.toml` contient la configuration JWT
- [ ] Toutes les fonctions sont redéployées
- [ ] JWT Verification est désactivé dans le Dashboard
- [ ] Les invocations retournent 200 (pas 401)
- [ ] Les notifications fonctionnent dans l'application
- [ ] Les logs montrent l'exécution du code
- [ ] `execution_id` n'est plus NULL

## 🎓 Concepts clés

### JWT (JSON Web Token)

Token d'authentification utilisé par Supabase pour vérifier l'identité des utilisateurs.

### Edge Functions

Fonctions serverless déployées sur le réseau edge de Supabase, exécutées avec Deno.

### Triggers Postgres

Fonctions SQL exécutées automatiquement lors d'événements (INSERT, UPDATE, DELETE).

### pg_net

Extension PostgreSQL permettant de faire des requêtes HTTP depuis la base de données.

### verify_jwt

Paramètre de configuration qui active/désactive la vérification JWT pour une Edge Function.

## 📅 Historique

| Date | Version | Changements |
|------|---------|-------------|
| 2024-02-01 | 1.0 | Création de la documentation |
| 2024-02-01 | 1.1 | Ajout des guides de déploiement |
| 2024-02-01 | 1.2 | Ajout de l'action immédiate |

## 🔄 Mises à jour

Ce document sera mis à jour si :
- De nouvelles Edge Functions sont ajoutées
- La configuration Supabase change
- De nouveaux problèmes sont identifiés

---

**Dernière mise à jour** : 2024-02-01

**Auteur** : Natively AI Assistant

**Projet** : Yombal Yoon - Système de notifications de covoiturage
