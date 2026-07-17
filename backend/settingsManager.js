const fs = require('fs')
const path = require('path')

const settingsPath = path.join(__dirname, 'uploads', 'settings.json')

const defaultSettings = {
  introVideoUrl: 'http://localhost:3000/uploads/intro/intro.mp4',
  hero: {
    phrases: [
      'Formations Pratiques',
      'Compétences Web & Tech',
      'Marketing & E-Commerce',
      'Design & Entrepreneuriat'
    ],
    subtitle: 'Des cours structurés et concrètement utiles. Payez facilement dans votre devise locale :'
  },
  mission: {
    title: "Propulser l'excellence et la confiance de chaque apprenant en Algérie",
    subtitle: "Notre mission est de vous transmettre les compétences les plus recherchées du marché avec un accompagnement humain, une méthode pratique et une confiance inébranlable.",
    pillars: [
      { id: 'trust', title: 'Confiance & Engagement', desc: 'Bâtir une confiance solide en vos capacités grâce à un apprentissage guidé et bienveillant.' },
      { id: 'excellence', title: 'Savoir & Pratique', desc: 'Des connaissances concrètes directes du terrain, conçues pour créer un impact réel et immédiat.' },
      { id: 'motivation', title: 'Motivation Continue', desc: 'Un suivi et une pédagogie inspirante pour vous maintenir motivé du premier au dernier jour.' }
    ]
  },
  learningPoints: [
    "Maîtrise complète des concepts théoriques et pratiques du domaine.",
    "Études de cas réelles et exercices concrètement applicables.",
    "Utilisation des outils professionnels les plus demandés du marché.",
    "Accès à l'attestation de réussite nominative Mylta Academy."
  ],
  testimonials: [
    {
      name: 'Amina Berrahal',
      role: 'Responsable Marketing, Alger',
      text: 'Mylta Academy m\'a permis de maîtriser le marketing digital rapidement. Les cours sont clairs, concrets et adaptés.',
      rating: 5,
      avatar: 'AB',
      course: 'Marketing Digital Avancé',
    },
    {
      name: 'Karim Meziane',
      role: 'Développeur Freelance, Oran',
      text: 'Une excellente plateforme. Le cours Full-Stack est très complet et le paiement par BaridiMob super pratique.',
      rating: 5,
      avatar: 'KM',
      course: 'Développement Web Full-Stack',
    },
    {
      name: 'Yasmine Taleb',
      role: 'Entrepreneure, Constantine',
      text: 'Très satisfaite de la formation Business. Des conseils très pratiques pour créer et gérer son entreprise en Algérie.',
      rating: 5,
      avatar: 'YT',
      course: 'Business & Entrepreneuriat DZ',
    },
    {
      name: 'Samy Benali',
      role: 'UX/UI Designer, Annaba',
      text: 'La pédagogie est tout simplement remarquable. J\'ai pu décrocher mes premiers clients freelances en un mois !',
      rating: 5,
      avatar: 'SB',
      course: 'Design & UX/UI Masterclass',
    },
    {
      name: 'Lyna Cherif',
      role: 'Consultante E-Commerce, Sétif',
      text: 'Une plateforme moderne et sérieuse. La vidéo de présentation et les cours sont d\'une qualité exceptionnelle.',
      rating: 5,
      avatar: 'LC',
      course: 'E-Commerce & Dropshipping DZ',
    },
    {
      name: 'Ryad Khelifi',
      role: 'Analyste Financier, Blida',
      text: 'Accompagnement au top et explications limpides. Je recommande Mylta Academy à tous les étudiants en Algérie !',
      rating: 5,
      avatar: 'RK',
      course: 'Finance & Gestion d\'Entreprise',
    },
  ],
  faq: [
    {
      question: "Ai-je besoin d'expérience pour commencer ?",
      answer: "Non, aucun prérequis n'est nécessaire ! Nos formations sont conçues de manière progressive, adaptées aussi bien aux débutants complets qu'aux personnes souhaitant perfectionner leurs compétences."
    },
    {
      question: "Combien de temps faut-il pour voir des résultats ?",
      answer: "Vous commencerez à appliquer des compétences concrètes dès les premiers modules. La plupart de nos étudiants constatent des progrès significatifs et mettent en pratique leurs acquis au bout de 2 à 4 semaines."
    },
    {
      question: "Est-ce que j'obtiens un certificat ?",
      answer: "Oui, absolument ! Après avoir terminé l'ensemble des modules d'une formation, vous recevez un certificat de réussite nominatif Mylta Academy à valoriser sur votre CV et votre profil LinkedIn."
    },
    {
      question: "Puis-je accéder aux cours à tout moment ?",
      answer: "Oui, l'accès est 100% illimité et disponible 24h/24 et 7j/7. Vous apprenez à votre propre rythme, sans aucune contrainte de temps ni date d'expiration."
    },
    {
      question: "Que faire si j'ai des questions ou si je reste bloqué ?",
      answer: "Vous n'êtes jamais seul ! Notre équipe pédagogique et notre communauté d'étudiants sont là pour vous accompagner. Vous pouvez poser vos questions directement sous chaque leçon ou contacter notre support."
    }
  ],
  topBanner: {
    isActive: true,
    text: "🚀 Promo exceptionnelle : -50% sur toutes les formations ! Inscrivez-vous vite.",
    animation: "marquee",
    hasCountdown: true,
    countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    backgroundColor: "bg-gradient-to-r from-red-600 to-red-500",
    textColor: "text-white",
    icon: "sparkles",
    linkUrl: "/courses",
    linkText: "Voir l'offre"
  },
  weeklyResource: {
    isActive: true,
    title: "Perplexity AI",
    tagline: "La pépite de la semaine",
    description: "Revenez jeudi prochain pour découvrir un nouvel outil secret indispensable !",
    url: "https://perplexity.ai",
    nextUpdateDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
}

function getSettings() {
  try {
    if (!fs.existsSync(settingsPath)) {
      const dir = path.dirname(settingsPath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2))
      return defaultSettings
    }
    const data = fs.readFileSync(settingsPath, 'utf8')
    return { ...defaultSettings, ...JSON.parse(data) }
  } catch (err) {
    console.error('Erreur lecture settings.json:', err)
    return defaultSettings
  }
}

function updateSettings(newSettings) {
  try {
    const current = getSettings()
    const updated = { ...current, ...newSettings }
    const dir = path.dirname(settingsPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(settingsPath, JSON.stringify(updated, null, 2))
    return updated
  } catch (err) {
    console.error('Erreur écriture settings.json:', err)
    throw err
  }
}

module.exports = { getSettings, updateSettings }
