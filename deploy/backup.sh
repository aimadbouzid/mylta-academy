#!/usr/bin/env bash
# ============================================================
# BACKUP — Mylta Academy (PostgreSQL + fichiers uploadés)
# ============================================================
# Sauvegarde la base de données et backend/uploads/ (reçus, miniatures,
# pièces d'identité, settings.json — settingsManager.js y stocke toute la
# config du site, elle n'existe nulle part ailleurs).
#
# Installation (crontab, tous les jours à 3h du matin) :
#   crontab -e
#   0 3 * * * /chemin/vers/deploy/backup.sh >> /var/log/myltaacademy-backup.log 2>&1
#
# Configurer DATABASE_URL et BACKUP_DIR ci-dessous, ou via variables d'env.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/myltaacademy}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/uploads"

# Charge DATABASE_URL depuis backend/.env si non déjà exportée
if [ -z "${DATABASE_URL:-}" ] && [ -f "$APP_DIR/backend/.env" ]; then
  export "$(grep -E '^DATABASE_URL=' "$APP_DIR/backend/.env" | sed -e 's/^DATABASE_URL=//' -e 's/^"//' -e 's/"$//' | xargs -I{} echo DATABASE_URL={})"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL introuvable (ni en variable d'env, ni dans backend/.env)." >&2
  exit 1
fi

echo "[$(date)] 🗄️  Dump PostgreSQL..."
pg_dump "$DATABASE_URL" --format=custom --file="$BACKUP_DIR/db/db_${TIMESTAMP}.dump"

echo "[$(date)] 📁 Archive des fichiers uploadés..."
tar -czf "$BACKUP_DIR/uploads/uploads_${TIMESTAMP}.tar.gz" -C "$APP_DIR/backend" uploads

echo "[$(date)] 🧹 Purge des sauvegardes de plus de ${RETENTION_DAYS} jours..."
find "$BACKUP_DIR/db" -name "db_*.dump" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR/uploads" -name "uploads_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "[$(date)] ✅ Backup terminé : $BACKUP_DIR/db/db_${TIMESTAMP}.dump, $BACKUP_DIR/uploads/uploads_${TIMESTAMP}.tar.gz"

# Restauration :
#   pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" db_XXXX.dump
#   tar -xzf uploads_XXXX.tar.gz -C backend/
