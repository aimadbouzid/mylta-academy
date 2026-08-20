#!/usr/bin/env bash
# ============================================================
# DEPLOY — Mylta Academy (mise à jour sur le VPS)
# ============================================================
# À exécuter DEPUIS le VPS, dans le dossier du dépôt cloné.
# Suppose : Node.js installé, PM2 installé globalement (`npm i -g pm2`),
# backend/.env déjà rempli avec les valeurs de production, PostgreSQL déjà
# accessible via DATABASE_URL.
#
# Premier déploiement : lancer une fois `pm2 start deploy/ecosystem.config.js`
# puis `pm2 save` + `pm2 startup` avant d'utiliser ce script pour les mises
# à jour suivantes.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "[$(date)] 📥 Récupération du code..."
git fetch origin
git reset --hard origin/main

echo "[$(date)] 💾 Backup avant migration (sécurité)..."
"$APP_DIR/deploy/backup.sh" || echo "⚠️  Backup échoué — poursuite quand même (vérifier manuellement)."

echo "[$(date)] 📦 Installation des dépendances backend..."
cd "$APP_DIR/backend"
npm ci --omit=dev

echo "[$(date)] 🗄️  Application des migrations Prisma..."
npx prisma generate
npx prisma migrate deploy

echo "[$(date)] 📦 Build du frontend..."
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "[$(date)] 🔁 Redémarrage du backend (PM2)..."
pm2 reload "$APP_DIR/deploy/ecosystem.config.js" --update-env

echo "[$(date)] ✅ Déploiement terminé."
echo "    Vérifier : curl -sf https://myltaacademy.com/api/health"
