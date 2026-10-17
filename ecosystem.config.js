// Configuration PM2 — relance automatique du serveur en production.
//
// Sur une exception non capturée, server.js s'arrête volontairement
// (arrêt gracieux). Sans gestionnaire de processus, le site reste donc
// hors ligne jusqu'à une intervention manuelle : PM2 le relance seul.
//
//   npx pm2 start ecosystem.config.js --env production
//   npx pm2 save && npx pm2 startup   # relance aussi après un reboot
//   npx pm2 logs mylta                # voir les journaux
//   npx pm2 reload mylta              # redéployer sans coupure
module.exports = {
  apps: [
    {
      name: 'mylta',
      script: 'server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      // Redémarrage si la mémoire s'emballe (fuite ou pic de charge).
      max_memory_restart: '500M',
      // Au-delà de 10 plantages en moins de 5 s, PM2 cesse de relancer en
      // boucle : c'est le signe d'une panne de configuration, pas d'un pic.
      min_uptime: '5s',
      max_restarts: 10,
      restart_delay: 2000,
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      time: true,
    },
  ],
}
