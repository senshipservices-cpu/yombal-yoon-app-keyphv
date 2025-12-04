
# GUIDE DE CONFIGURATION DES CRON JOBS SUPABASE

## 📅 TÂCHES PLANIFIÉES POUR COVOITURAGE

---

## 🔧 CONFIGURATION DANS SUPABASE DASHBOARD

### Accès:
1. Ouvrir **Supabase Dashboard**
2. Sélectionner le projet **Yombal Yoon**
3. Aller dans **Database** > **Cron Jobs** (ou **Extensions** > **pg_cron**)

---

## ⏰ CRON JOB 1: RIDE REMINDERS

### Configuration:

**Nom:** `ride-reminders`

**Description:** Envoie les rappels J-1 (24h avant) et H-1 (1h avant) pour les trajets

**Schedule (Cron Expression):** `*/10 * * * *`
- Signification: Toutes les 10 minutes
- Recommandé pour ne pas manquer les fenêtres de rappel

**SQL Command:**
```sql
SELECT
  net.http_post(
    url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
```

**Alternative (si pg_net n'est pas disponible):**
Utiliser **Supabase Edge Functions Cron** dans le Dashboard:
- Function: `on-ride-reminders`
- Schedule: `*/10 * * * *`
- HTTP Method: POST
- Payload: `{}`

---

## ⭐ CRON JOB 2: RATING REQUESTS

### Configuration:

**Nom:** `rating-requests`

**Description:** Envoie les demandes de notation 10-30 minutes après la fin d'un trajet

**Schedule (Cron Expression):** `*/5 * * * *`
- Signification: Toutes les 5 minutes
- Recommandé pour envoyer les demandes rapidement après la fin du trajet

**SQL Command:**
```sql
SELECT
  net.http_post(
    url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
```

**Alternative (si pg_net n'est pas disponible):**
Utiliser **Supabase Edge Functions Cron** dans le Dashboard:
- Function: `on-rating-request`
- Schedule: `*/5 * * * *`
- HTTP Method: POST
- Payload: `{}`

---

## 📊 EXPRESSIONS CRON EXPLIQUÉES

### Format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Jour de la semaine (0-7, 0 et 7 = Dimanche)
│ │ │ └───── Mois (1-12)
│ │ └─────── Jour du mois (1-31)
│ └───────── Heure (0-23)
└─────────── Minute (0-59)
```

### Exemples:

| Expression | Signification |
|------------|---------------|
| `*/5 * * * *` | Toutes les 5 minutes |
| `*/10 * * * *` | Toutes les 10 minutes |
| `*/15 * * * *` | Toutes les 15 minutes |
| `0 * * * *` | Toutes les heures (à la minute 0) |
| `0 0 * * *` | Tous les jours à minuit |
| `0 8 * * *` | Tous les jours à 8h00 |
| `0 */6 * * *` | Toutes les 6 heures |

---

## 🔐 CONFIGURATION DE LA SERVICE ROLE KEY

### Option 1: Via pg_cron (SQL)

1. **Activer l'extension pg_net:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

2. **Configurer la service role key:**
```sql
-- Créer une fonction pour stocker la clé
CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; -- Votre service role key
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Créer le cron job:**
```sql
SELECT cron.schedule(
  'ride-reminders',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || get_service_role_key()
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

### Option 2: Via Supabase Dashboard (Recommandé)

1. Aller dans **Database** > **Cron Jobs**
2. Cliquer sur **Create a new cron job**
3. Remplir les champs:
   - Name: `ride-reminders`
   - Schedule: `*/10 * * * *`
   - Command: (voir SQL ci-dessus)
4. Cliquer sur **Create**

---

## 🧪 TESTER LES CRON JOBS

### Test manuel:

```sql
-- Tester ride-reminders
SELECT
  net.http_post(
    url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_service_role_key()
    ),
    body := '{}'::jsonb
  ) as request_id;

-- Tester rating-requests
SELECT
  net.http_post(
    url := 'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || get_service_role_key()
    ),
    body := '{}'::jsonb
  ) as request_id;
```

### Vérifier les logs:

```sql
-- Voir les exécutions du cron
SELECT * FROM cron.job_run_details
WHERE jobname IN ('ride-reminders', 'rating-requests')
ORDER BY start_time DESC
LIMIT 10;

-- Voir les logs de notifications
SELECT * FROM notification_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 📝 ALTERNATIVE: UTILISER UN SERVICE EXTERNE

Si pg_cron n'est pas disponible ou si vous préférez un service externe:

### Option 1: Vercel Cron Jobs

1. Créer un fichier `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/ride-reminders",
      "schedule": "*/10 * * * *"
    },
    {
      "path": "/api/cron/rating-requests",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. Créer les endpoints API:
```typescript
// api/cron/ride-reminders.ts
export default async function handler(req, res) {
  const response = await fetch(
    'https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );
  
  const data = await response.json();
  res.status(200).json(data);
}
```

### Option 2: GitHub Actions

1. Créer `.github/workflows/cron-jobs.yml`:
```yaml
name: Cron Jobs

on:
  schedule:
    - cron: '*/10 * * * *'  # Ride reminders
    - cron: '*/5 * * * *'   # Rating requests

jobs:
  ride-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call ride-reminders
        run: |
          curl -X POST \
            https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-ride-reminders \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'

  rating-requests:
    runs-on: ubuntu-latest
    steps:
      - name: Call rating-requests
        run: |
          curl -X POST \
            https://drxtaxepofuoelplgrei.supabase.co/functions/v1/on-rating-request \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

---

## ✅ CHECKLIST DE CONFIGURATION

- [ ] Extension `pg_cron` activée
- [ ] Extension `pg_net` activée (si nécessaire)
- [ ] Service role key configurée
- [ ] Cron job `ride-reminders` créé (*/10 * * * *)
- [ ] Cron job `rating-requests` créé (*/5 * * * *)
- [ ] Tests manuels effectués
- [ ] Logs vérifiés
- [ ] Monitoring en place

---

## 🔍 MONITORING

### Vérifier que les cron jobs fonctionnent:

```sql
-- Nombre de notifications envoyées dans la dernière heure
SELECT 
  channel,
  status,
  COUNT(*) as count
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY channel, status;

-- Dernières exécutions des cron jobs
SELECT 
  jobname,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobname IN ('ride-reminders', 'rating-requests')
ORDER BY start_time DESC
LIMIT 20;
```

---

## 🚨 TROUBLESHOOTING

### Problème: Les cron jobs ne s'exécutent pas

**Solutions:**
1. Vérifier que `pg_cron` est activé:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Vérifier les permissions:
   ```sql
   GRANT USAGE ON SCHEMA cron TO postgres;
   ```

3. Vérifier les logs:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
   ```

### Problème: Erreur d'authentification

**Solutions:**
1. Vérifier la service role key
2. Vérifier que l'Edge Function est déployée
3. Vérifier les headers HTTP

---

**Configuration terminée! Les cron jobs sont maintenant opérationnels. 🎉**
