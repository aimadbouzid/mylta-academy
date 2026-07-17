// ============================================================
// SEED — Données de test pour Mylta Academy (3 Formations)
// Commande: npm run db:seed
// ============================================================

const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

const prisma = new PrismaClient()

const COURSES_DATA = [
  {
    title: 'Marketing Digital Avancé',
    description: 'Maîtrisez les stratégies de marketing digital pour booster votre présence en ligne et générer des leads qualifiés en Algérie.',
    price: 5000,
    discountPrice: 3000,
    category: 'Marketing',
    duration: '12h 30min',
    level: 'Avancé',
    isPublished: true,
    lessons: [
      { title: 'Introduction au Marketing Digital', description: 'Vue d\'ensemble des canaux et stratégies', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_1/view', order: 1, duration: '45min' },
      { title: 'SEO & Référencement Naturel', description: 'Optimisation pour Google DZ', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_2/view', order: 2, duration: '1h 15min' },
      { title: 'Publicité sur les Réseaux Sociaux', description: 'Facebook, Instagram, TikTok Ads', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_3/view', order: 3, duration: '1h 30min' },
      { title: 'Email Marketing & Automation', description: 'Séquences automatisées pour convertir', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_4/view', order: 4, duration: '55min' },
    ],
  },
  {
    title: 'Développement Web Full-Stack',
    description: 'Apprenez à créer des applications web modernes avec React, Node.js et les technologies les plus demandées du marché.',
    price: 5000,
    discountPrice: 3000,
    category: 'Tech',
    duration: '28h 00min',
    level: 'Intermédiaire',
    isPublished: true,
    lessons: [
      { title: 'HTML5 & CSS3 Modernes', description: 'Les bases solides du web', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_5/view', order: 1, duration: '2h 00min' },
      { title: 'JavaScript Avancé & ES6+', description: 'Fonctionnalités modernes', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_6/view', order: 2, duration: '3h 30min' },
      { title: 'React & Hooks', description: 'Interfaces réactives professionnelles', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_7/view', order: 3, duration: '4h 00min' },
      { title: 'Node.js & Express', description: 'Backend JavaScript robuste', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_8/view', order: 4, duration: '3h 00min' },
    ],
  },
  {
    title: 'Business & Entrepreneuriat en Algérie',
    description: 'Créez et développez votre entreprise en Algérie. De l\'idée au lancement, toutes les étapes pratiques avec les réglementations locales.',
    price: 5000,
    discountPrice: 3000,
    category: 'Business',
    duration: '8h 45min',
    level: 'Débutant',
    isPublished: true,
    lessons: [
      { title: 'Idéation & Validation du Marché', description: 'Trouver une idée rentable', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_10/view', order: 1, duration: '1h 00min' },
      { title: 'Business Plan Simplifié', description: 'Le plan qui convainct les investisseurs', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_11/view', order: 2, duration: '1h 30min' },
      { title: 'Inscription au CNRC & Statuts', description: 'Étapes légales en Algérie', externalVideoUrl: 'https://drive.google.com/file/d/DEMO_ID_12/view', order: 3, duration: '45min' },
    ],
  },
]

async function main() {
  console.log('\n🌱 Re-initialisation propre de la base de données Mylta Academy...\n')

  // Nettoyage préalable pour éviter les doublons
  await prisma.receipt.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()

  // ─── Créer le compte Admin ───
  const adminPassword = await argon2.hash('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@myltaacademy.dz' },
    update: {},
    create: {
      email: 'admin@myltaacademy.dz',
      password: adminPassword,
      name: 'Administrateur Mylta Academy',
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log(`✅ Admin créé: ${admin.email} (mot de passe: admin123)`)

  // ─── Créer un étudiant de test ───
  const studentPassword = await argon2.hash('student123')
  const student = await prisma.user.upsert({
    where: { email: 'ahmed@test.dz' },
    update: {},
    create: {
      email: 'ahmed@test.dz',
      password: studentPassword,
      name: 'Ahmed Benali',
      role: 'STUDENT',
      emailVerified: true,
    },
  })
  console.log(`✅ Étudiant créé: ${student.email} (mot de passe: student123)`)

  // ─── Créer les 3 formations ───
  const createdCourses = []
  for (const data of COURSES_DATA) {
    const { lessons, ...courseInfo } = data
    const course = await prisma.course.create({
      data: { ...courseInfo, lessons: { create: lessons } },
    })
    createdCourses.push(course)
    console.log(`✅ Formation: "${course.title}" (${course.price.toLocaleString()} DZD)`)
  }

  // ─── Créer un reçu approuvé pour l'étudiant ───
  if (createdCourses.length > 0) {
    await prisma.receipt.create({
      data: {
        userId: student.id,
        courseId: createdCourses[0].id,
        amount: createdCourses[0].price,
        status: 'APPROVED',
        paymentType: 'CCP',
        notes: 'Paiement vérifié manuellement - seed de test',
      },
    })
    console.log(`✅ Accès accordé à Ahmed pour: "${createdCourses[0].title}"`)
  }

  // ─── Créer un reçu PENDING ───
  if (createdCourses.length > 1) {
    await prisma.receipt.create({
      data: {
        userId: student.id,
        courseId: createdCourses[1].id,
        amount: createdCourses[1].price,
        status: 'PENDING',
        paymentType: 'BARIDIMOB',
        notes: 'En attente de vérification',
      },
    })
    console.log(`⏳ Reçu PENDING créé pour: "${createdCourses[1].title}"`)
  }

  console.log('\n🎉 Base de données initialisée avec 3 formations !')
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
