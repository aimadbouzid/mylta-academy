// ============================================================
// PM2 — Mylta Academy Backend (process manager de production)
// ============================================================
// Usage :
//   pm2 start deploy/ecosystem.config.js
//   pm2 save
//   pm2 startup            (une fois, pour redémarrer au reboot du VPS)
//
// Pourquoi PM2 plutôt que `node server.js` en direct :
//   - redémarre le process s'il crashe (uncaughtException force déjà un
//     gracefulShutdown côté server.js, mais rien ne relance le process après)
//   - garde le process vivant après un reboot du VPS (via `pm2 startup`)
//   - centralise stdout/stderr dans des fichiers avec rotation (pm2-logrotate)
//
// NODE_ENV=production doit être défini AVANT le démarrage : c'est ce qui
// active la vérification du JWT_SECRET, les cookies Secure/__Host-, le
// prerendering SEO et le blocage HTTP→HTTPS dans backend/server.js.
module.exports = {
  apps: [
    {
      name: 'mylta-academy-api',
      script: './server.js',
      cwd: __dirname + '/../backend',
      instances: 1, // socket.io + rate-limit en mémoire : ne pas passer en cluster sans adapter Redis
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      // Le .env réel est chargé par dotenv dans server.js — PM2 n'a pas besoin
      // de dupliquer les secrets ici.
      max_memory_restart: '400M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      time: true,
    },
  ],
}
