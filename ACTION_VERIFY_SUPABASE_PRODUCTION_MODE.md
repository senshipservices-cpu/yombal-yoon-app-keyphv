
# 🔍 Action Immédiate : Vérifier IS_PRODUCTION_MODE dans Supabase

## ⚠️ Action Requise

Pour que le mode Production fonctionne correctement dans l'Edge Function `send-otp-twilio`, vous devez vérifier et configurer la variable d'environnement dans Supabase.

---

## 🎯 Objectif

Confirmer que `IS_PRODUCTION_MODE=true` est bien défini dans les secrets Supabase pour que l'Edge Function applique les règles de production (numéros uniques).

---

## 📋 Méthode 1 : Via Supabase Dashboard (Recommandé)

### Étape 1 : Accéder aux Secrets

1. Ouvrez votre projet Supabase : https://supabase.com/dashboard/project/drxtaxepofuoelplgrei
2. Allez dans **Settings** (⚙️ en bas à gauche)
3. Cliquez sur **Edge Functions** dans le menu latéral
4. Cliquez sur **Manage secrets**

### Étape 2 : Vérifier/Ajouter le Secret

**Vérifier si `IS_PRODUCTION_MODE` existe :**

- Si **OUI** : Vérifiez que la valeur est `true`
- Si **NON** : Ajoutez-le

**Pour ajouter/modifier :**

1. Cliquez sur **Add new secret** (ou **Edit** si existe)
2. **Name :** `IS_PRODUCTION_MODE`
3. **Value :** `true`
4. Cliquez sur **Save**

### Étape 3 : Redéployer l'Edge Function (Optionnel)

Si vous avez modifié le secret, redéployez la fonction :

1. Allez dans **Edge Functions**
2. Trouvez `send-otp-twilio`
3. Cliquez sur **Deploy** ou **Redeploy**

**OU** utilisez la CLI :

```bash
supabase functions deploy send-otp-twilio
```

---

## 📋 Méthode 2 : Via Supabase CLI

### Prérequis

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref drxtaxepofuoelplgrei
```

### Commandes

```bash
# 1. Vérifier les secrets existants
supabase secrets list

# 2. Définir IS_PRODUCTION_MODE à true
supabase secrets set IS_PRODUCTION_MODE=true

# 3. Vérifier que c'est bien défini
supabase secrets list

# 4. Redéployer l'Edge Function
supabase functions deploy send-otp-twilio

# 5. Voir les logs en temps réel
supabase functions logs send-otp-twilio --follow
```

---

## ✅ Vérification

### Dans les Logs Supabase

Après avoir défini le secret et redéployé, testez l'envoi d'un OTP et vérifiez les logs :

**Logs attendus :**

```
📥 Request: { 
  action: 'send', 
  phoneNumber: '+221XXXXXXXXX', 
  userId: 'xxx', 
  mode: 'Production'  ← Doit afficher "Production"
}

📤 Sending OTP via whatsapp from whatsapp:+14155238886 to whatsapp:+221XXXXXXXXX [Mode: Production]
✅ OTP sent successfully via whatsapp
```

**Si vous voyez "Mode: Test" :**
- ❌ Le secret n'est pas défini ou est à `false`
- ❌ L'Edge Function n'a pas été redéployée

### Dans l'Application

Testez le workflow OTP :

1. **Enregistrer un numéro** : +221XXXXXXXXX
2. **Vérifier l'OTP**
3. **Essayer de réutiliser le même numéro** avec un autre compte
4. **Résultat attendu :** ❌ "Ce numéro est déjà utilisé par un autre compte"

**Si vous pouvez réutiliser le numéro :**
- ❌ Le mode Production n'est pas actif dans Supabase
- ❌ Vérifiez le secret et redéployez

---

## 🔧 Dépannage

### Problème : Le secret n'apparaît pas dans la liste

**Solution :**
```bash
# Définir à nouveau
supabase secrets set IS_PRODUCTION_MODE=true

# Attendre quelques secondes
sleep 5

# Vérifier
supabase secrets list
```

### Problème : Les logs affichent toujours "Mode: Test"

**Solutions :**
1. Vérifier que le secret est bien `true` (pas `"true"` avec guillemets)
2. Redéployer l'Edge Function
3. Attendre 30 secondes pour la propagation
4. Tester à nouveau

### Problème : Erreur lors du déploiement

**Solution :**
```bash
# Vérifier la connexion
supabase projects list

# Relancer le déploiement
supabase functions deploy send-otp-twilio --no-verify-jwt
```

---

## 📊 Résumé des Secrets Requis

Voici tous les secrets nécessaires pour Twilio en production :

| Secret | Valeur | Statut |
|--------|--------|--------|
| `IS_PRODUCTION_MODE` | `true` | ⚠️ À vérifier |
| `TWILIO_ACCOUNT_SID` | `AC...` | ✅ Configuré |
| `TWILIO_AUTH_TOKEN` | `...` | ✅ Configuré |
| `TWILIO_WHATSAPP_NUMBER` | `+14155238886` | ✅ Configuré |
| `TWILIO_PHONE_NUMBER` | `+1...` | ✅ Configuré (fallback SMS) |

---

## 🎯 Commande Rapide (Tout-en-Un)

```bash
# Définir le mode Production et redéployer
supabase secrets set IS_PRODUCTION_MODE=true && \
supabase functions deploy send-otp-twilio && \
echo "✅ Configuration terminée ! Testez maintenant l'OTP."
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier les logs :**
   ```bash
   supabase functions logs send-otp-twilio --follow
   ```

2. **Tester l'envoi d'OTP** et observer les logs

3. **Consulter la documentation :**
   - `CONFIGURATION_COMPLETE_TWILIO_PRODUCTION.md`
   - `PRODUCTION_MODE_GUIDE.md`
   - `TWILIO_PRODUCTION_SETUP.md`

---

## ✅ Checklist Finale

- [ ] Secret `IS_PRODUCTION_MODE=true` défini dans Supabase
- [ ] Edge Function `send-otp-twilio` redéployée
- [ ] Logs affichent "Mode: Production"
- [ ] Test OTP réussi
- [ ] Impossible de réutiliser un numéro (comportement attendu)
- [ ] Commissions toujours à 0 FCFA (IS_TEST_MODE=true)

---

**Une fois cette vérification terminée, votre configuration sera 100% complète !** 🎉
