// ============================================================
// CREATE CLUB ORGANIZER — compte nominatif de l'espace /club/admin
// ============================================================
// Donne à une personne son propre accès aux inscriptions et aux
// événements du club, sans rien lui ouvrir du reste du site : ni les
// élèves de l'académie, ni les paiements, ni les réglages.
//
// Usage :
//   ORGANIZER_NAME='Sadeli Dounia' ORGANIZER_LOGIN=dounia \
//     ORGANIZER_PASSWORD='MotDePasseFort!23' \
//     node scripts/create-club-organizer.js
//
// Le mot de passe n'est ni affiché ni enregistré en clair : seule son
// empreinte argon2 est gardée. Relancer le script sur un identifiant
// existant remplace le mot de passe — c'est ainsi qu'on en change un.
//
// Pour retirer l'accès d'un organisateur parti :
//   ORGANIZER_LOGIN=dounia ORGANIZER_DISABLE=1 node scripts/create-club-organizer.js

const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

const prisma = new PrismaClient()

async function main() {
  const login = process.env.ORGANIZER_LOGIN?.trim().toLowerCase()
  const name = process.env.ORGANIZER_NAME?.trim()
  const password = process.env.ORGANIZER_PASSWORD
  const disable = process.env.ORGANIZER_DISABLE === '1'

  if (!login || !/^[a-z0-9._-]{3,30}$/.test(login)) {
    console.error('❌ ORGANIZER_LOGIN manquant ou invalide (3 à 30 caractères : lettres, chiffres, . _ -).')
    process.exit(1)
  }

  if (disable) {
    const gone = await prisma.clubOrganizer.updateMany({ where: { login }, data: { active: false } })
    if (!gone.count) {
      console.error(`❌ Aucun organisateur « ${login} ».`)
      process.exit(1)
    }
    console.log(`✅ Accès retiré à « ${login} ». Son compte est conservé, désactivé.`)
    return
  }

  if (!name || name.length < 3) {
    console.error('❌ ORGANIZER_NAME manquant (le nom affiché de la personne).')
    process.exit(1)
  }
  if (!password || password.length < 12) {
    console.error('❌ ORGANIZER_PASSWORD manquant ou trop court (12 caractères minimum).')
    process.exit(1)
  }

  const hashed = await argon2.hash(password)
  const existed = await prisma.clubOrganizer.findUnique({ where: { login }, select: { id: true } })

  await prisma.clubOrganizer.upsert({
    where: { login },
    update: { name, password: hashed, active: true },
    create: { login, name, password: hashed },
  })

  console.log(existed
    ? `✅ Mot de passe remplacé pour « ${name} » (identifiant : ${login}).`
    : `✅ Organisateur créé : « ${name} » (identifiant : ${login}).`)
  console.log('   Connexion : https://myltaacademy.com/club/admin')
  console.log("   Transmettez-lui le mot de passe de vive voix, pas par message.")
}

main()
  .catch((err) => { console.error('❌', err.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
