// ============================================================
// CREATE ADMIN — création/mise à jour sûre d'un compte admin
// ============================================================
// À utiliser en production À LA PLACE de `npm run db:seed`, qui crée un
// admin avec un mot de passe codé en dur (admin123) plus deux comptes de
// test — corrects en développement, dangereux sur un VPS public.
//
// Usage :
//   ADMIN_EMAIL=vous@exemple.com ADMIN_PASSWORD='MotDePasseFort!23' \
//     node scripts/create-admin.js
//
// Le mot de passe n'est jamais affiché ni loggé. Le script échoue si la
// variable est absente ou trop faible plutôt que de retomber sur une valeur
// par défaut.

const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim() || 'Admin'

  if (!email || !email.includes('@')) {
    console.error('❌ ADMIN_EMAIL manquant ou invalide.')
    process.exit(1)
  }
  if (!password || password.length < 12) {
    console.error('❌ ADMIN_PASSWORD manquant ou trop court (12 caractères minimum).')
    process.exit(1)
  }

  const hashed = await argon2.hash(password)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: 'ADMIN',
      emailVerified: true,
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
    create: {
      email,
      password: hashed,
      name,
      role: 'ADMIN',
      authProvider: 'LOCAL',
      emailVerified: true,
    },
    select: { id: true, email: true, role: true },
  })

  console.log(`✅ Compte admin prêt : ${admin.email} (id ${admin.id}, role ${admin.role})`)
}

main()
  .catch((err) => {
    console.error('❌ Échec de la création admin :', err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
