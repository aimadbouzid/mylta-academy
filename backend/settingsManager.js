const fs = require('fs')
const path = require('path')

const settingsPath = path.join(__dirname, 'uploads', 'settings.json')

const defaultSettings = {
  introVideoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
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
    text2: "🔥 Places limitées ! Sécurisez votre place et commencez à apprendre dès aujourd'hui.",
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
  },
  // ── Marketplace Settings ──
  marketplace: {
    enabled: true,
    instructorSpotPrice: 5000,      // Prix d'une place formateur (DA)
    defaultCommissionRate: 20,      // % commission plateforme par défaut
    autoApproveInstructors: false,  // Approbation manuelle par défaut
    autoApproveCourses: false,      // Modération manuelle par défaut
    minPayoutAmount: 1000,          // Montant minimum de retrait (DA)
    maxPayoutAmount: 0,             // Plafond par demande (DA) — 0 = pas de plafond
    payoutsEnabled: true,           // Permet de suspendre tous les retraits
    requireIdentityForPayout: true, // Exige une identité vérifiée avant tout retrait
    // Nombre de formations qu'un formateur peut créer, selon son offre.
    // 0 (ou absent) = illimité. Modifiable par l'admin via PUT /api/admin/config.
    defaultCourseLimit: 3,
    courseLimitByPlan: {
      Starter: 3,
      Pro: 10,
      Elite: 0,                     // illimité
    },
  },
  // Coaching en ligne : tout est modifiable depuis l'admin (onglet Coaching).
  // Textes volontairement simples : la page s'adresse à des débutants.
  // weekdays : 0 = dimanche … 6 = samedi. timeSlots vide = date seule.
  coaching: {
    version: 4,
    enabled: true,
    title: 'Coaching en ligne',
    subtitle: "Un coach rien que pour vous, pour apprendre l'IA ou créer votre site.",
    whatsappNumber: '213795103743',
    currency: 'DA',
    // Sujets regroupés par thème (category) : la page les affiche par groupe.
    topics: [
      { id: 'ia-chatgpt', category: "L'intelligence artificielle (IA)", label: "Bien utiliser ChatGPT et l'IA", description: 'Poser les bonnes questions et gagner du temps chaque jour', price: 0, duration: '' },
      { id: 'ia-video', category: "L'intelligence artificielle (IA)", label: "Faire des vidéos avec l'IA", description: 'Sans caméra ni montage compliqué', price: 0, duration: '' },
      { id: 'ia-textes', category: "L'intelligence artificielle (IA)", label: "Écrire des textes avec l'IA", description: 'Publications, textes de vidéos, publicités', price: 0, duration: '' },
      { id: 'ia-images', category: "L'intelligence artificielle (IA)", label: "Créer des images avec l'IA", description: 'Affiches, visuels et photos de produits', price: 0, duration: '' },
      { id: 'ia-reseaux', category: "L'intelligence artificielle (IA)", label: "Publier sur les réseaux sociaux avec l'IA", description: 'Trouver des idées et publier régulièrement', price: 0, duration: '' },
      { id: 'ia-temps', category: "L'intelligence artificielle (IA)", label: "Gagner du temps avec l'IA", description: "Laisser l'IA faire les tâches qui se répètent", price: 0, duration: '' },
      { id: 'creer-site', category: "Créer avec l'IA, sans savoir coder", label: 'Créer un site internet', description: 'Pour présenter votre activité ou votre travail', price: 0, duration: '' },
      { id: 'creer-page-vente', category: "Créer avec l'IA, sans savoir coder", label: 'Créer une page de vente', description: 'Une page simple pour vendre un produit ou un service', price: 0, duration: '' },
      { id: 'creer-outil', category: "Créer avec l'IA, sans savoir coder", label: 'Créer un outil pour votre entreprise', description: 'Suivre vos clients, vos rendez-vous ou votre stock', price: 0, duration: '' },
      { id: 'creer-app', category: "Créer avec l'IA, sans savoir coder", label: 'Créer une application', description: "Pour téléphone ou ordinateur, de l'idée au lancement", price: 0, duration: '' },
    ],
    // Une seule formule = aucune question posée au client. Plusieurs = il choisit.
    formats: [
      { id: 'seance', label: 'Séance', duration: '2h30', price: 0, description: '' },
    ],
    channels: [], // vide = le moyen de visio est convenu sur WhatsApp
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    timeSlots: ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30'],
    bookUntil: '2028-12-31', // dernière date réservable (AAAA-MM-JJ)
    blockedDates: [],
  },
  modules: {
    instructorEnabled: true,
    resourcesEnabled: true,
    // Redirige les visiteurs venus d'Instagram/TikTok/Facebook (navigateur
    // intégré) vers Chrome/Safari — voir InAppBrowserGuard côté frontend.
    inAppBrowserGuardEnabled: true
  }
}

// Réglages coaching enregistrés par une version antérieure : le contenu (sujets,
// formules, horaires, textes) repart des valeurs par défaut actuelles ; seuls les
// réglages propres à l'admin hors contenu sont conservés. Une seule fois : l'admin
// réenregistre ensuite avec la version courante.
function upgradeCoaching(saved) {
  const def = defaultSettings.coaching
  if (!saved) return { ...def }
  if (saved.version === def.version) return { ...def, ...saved }
  const merged = { ...def }
  for (const k of ['enabled', 'whatsappNumber', 'currency', 'blockedDates']) {
    if (saved[k] !== undefined) merged[k] = saved[k]
  }
  return merged
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
    const parsed = JSON.parse(data)
    return {
      ...defaultSettings,
      ...parsed,
      hero: { ...defaultSettings.hero, ...(parsed.hero || {}) },
      mission: { ...defaultSettings.mission, ...(parsed.mission || {}) },
      topBanner: { ...defaultSettings.topBanner, ...(parsed.topBanner || {}) },
      weeklyResource: { ...defaultSettings.weeklyResource, ...(parsed.weeklyResource || {}) },
      marketplace: {
        ...defaultSettings.marketplace,
        ...(parsed.marketplace || {}),
        // Fusion explicite : un plan absent du fichier garde sa limite par défaut
        courseLimitByPlan: {
          ...defaultSettings.marketplace.courseLimitByPlan,
          ...(parsed.marketplace?.courseLimitByPlan || {}),
        },
      },
      modules: { ...defaultSettings.modules, ...(parsed.modules || {}) },
      coaching: upgradeCoaching(parsed.coaching),
    }
  } catch (err) {
    console.error('Erreur lecture settings.json:', err)
    return defaultSettings
  }
}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

function updateSettings(newSettings) {
  try {
    const current = getSettings()

    // Fusion en profondeur (1 niveau) : envoyer { marketplace: { minPayoutAmount } }
    // ne doit pas effacer les autres réglages marketplace (commission, prix de place…).
    const updated = { ...current }
    for (const [key, value] of Object.entries(newSettings || {})) {
      updated[key] = isPlainObject(value) && isPlainObject(current[key])
        ? { ...current[key], ...value }
        : value
    }
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
