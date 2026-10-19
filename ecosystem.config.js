// Alias — un seul fichier fait foi : deploy/ecosystem.config.js, celui que
// deploy/deploy.sh utilise en production, où l'application tourne sous le nom
// « mylta-academy-api ».
//
// Ce fichier déclarait auparavant une seconde application nommée « mylta »,
// avec ses propres réglages. Lancer « pm2 start ecosystem.config.js » depuis
// la racine créait donc un deuxième processus sur le même port, pendant que
// « pm2 reload mylta » échouait contre le vrai, qui ne porte pas ce nom.
//
//   npx pm2 logs mylta-academy-api                           # les journaux
//   npx pm2 reload deploy/ecosystem.config.js --update-env   # redéployer
//
// --update-env est nécessaire après toute modification de backend/.env :
// sans lui, PM2 relance le processus avec l'environnement d'origine.
module.exports = require('./deploy/ecosystem.config.js')
