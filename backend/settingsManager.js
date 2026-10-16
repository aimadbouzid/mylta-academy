const fs = require('fs')
const path = require('path')

const settingsPath = path.join(__dirname, 'uploads', 'settings.json')

const defaultSettings = {
  introVideoUrl: '/intro-logo.mp4',
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
    text: "Nouveau : coaching en ligne IA & vibe coding — réservez votre séance de 2h30",
    text2: "Formation IA & Montage Vidéo en présentiel — offre de lancement, places limitées",
    animation: "marquee",
    hasCountdown: false,
    countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    backgroundColor: "bg-gradient-to-r from-red-600 to-red-500",
    textColor: "text-white",
    icon: "sparkles",
    linkUrl: "/coaching",
    linkText: "Réserver"
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
  // Formations annoncées (« Bientôt ») : affichées tant qu'elles ne sont pas en
  // ligne, avec une fiche détaillée. Modifiables dans l'admin (Formations à venir).
  upcomingCourses: [
    {
      id: 'montage-capcut', title: 'Montage vidéo sur smartphone avec CapCut', category: 'Vidéo', level: 'Débutant', duration: '',
      price: 3000, oldPrice: 5000,
      description: 'Filmer, monter et publier des vidéos courtes de qualité, uniquement avec votre téléphone.',
      program: [
        'Bien filmer avec son smartphone : cadrage, lumière et son',
        'Prendre en main CapCut',
        'Monter une vidéo dynamique : coupes, transitions, rythme',
        'Ajouter sous-titres, musique et effets',
        'Créer des vidéos courtes qui vendent (UGC, publicités)',
        'Exporter et publier sur TikTok, Reels et YouTube',
      ],
      included: ['Accès illimité', '100 % sur smartphone', 'Certificat de fin de formation'],
    },
    {
      id: 'ia-quotidien', title: "L'IA au quotidien : ChatGPT et les outils IA", category: 'IA', level: 'Débutant', duration: '',
      price: 3000, oldPrice: 5000,
      description: "Gagner du temps chaque jour : écrire, chercher, créer des images et automatiser avec l'IA.",
      program: [
        "Comprendre l'IA simplement",
        'Bien parler à ChatGPT : faire les bonnes demandes',
        "Écrire textes, emails et publications avec l'IA",
        "Créer des images avec l'IA",
        "Gagner du temps en confiant les tâches répétitives à l'IA",
        'Les meilleurs outils IA gratuits',
      ],
      included: ['Accès illimité', 'Exemples prêts à copier', 'Certificat de fin de formation'],
    },
    {
      id: 'site-ia', title: "Créer son site avec l'IA, sans savoir coder", category: 'Vibe coding', level: 'Débutant', duration: '',
      price: 3000, oldPrice: 5000,
      description: "Construire un site ou une page de vente professionnelle grâce à l'IA, étape par étape.",
      program: [
        "Comprendre le vibe coding : créer avec l'IA",
        'Préparer son projet et son contenu',
        "Créer son site pas à pas avec l'IA",
        'Créer une page de vente qui convertit',
        'Mettre son site en ligne avec son nom de domaine',
        'Modifier et améliorer son site sans développeur',
      ],
      included: ['Accès illimité', 'Aucune compétence technique requise', 'Certificat de fin de formation'],
    },
  ],
  // Coaching en ligne : tout est modifiable depuis l'admin (onglet Coaching).
  // Textes volontairement simples : la page s'adresse à des débutants.
  // weekdays : 0 = dimanche … 6 = samedi. timeSlots vide = date seule.
  coaching: {
    version: 6,
    enabled: true,
    title: 'Coaching en ligne',
    subtitle: "Seul ou avec vos amis, un coach vous accompagne pour apprendre l'IA ou créer votre site.",
    // Étiquettes très courtes, en grille de 3 en haut de la page.
    infos: ['2h30', 'En appel vidéo', 'Seul ou en groupe', 'Débutants OK', '7 jours sur 7', 'Réponse rapide'],
    // Choix proposés : Individuel, À 2, À 3… ; la dernière valeur (si ≥ 4) s'affiche
    // « En groupe (4+) ». L'individuel reste présélectionné et recommandé.
    maxParticipants: 4,
    whatsappNumber: '213795103743',
    currency: 'DA',
    // Sujets regroupés par thème (category) : la page les affiche par groupe.
    topics: [
      { id: 'pack-createur', category: "L'intelligence artificielle (IA)", label: 'Pack Vidéos & Photos IA', description: 'Faire des vidéos, des photos et des voix avec l\'IA, sans caméra', price: 0, duration: '' },
      { id: 'pack-avatar', category: "L'intelligence artificielle (IA)", label: 'Pack Avatar IA', description: 'Un personnage qui vous ressemble et parle à votre place en vidéo', price: 0, duration: '' },
      { id: 'pack-productivite', category: "L'intelligence artificielle (IA)", label: 'Pack ChatGPT au travail', description: 'Écrire, chercher et organiser votre travail deux fois plus vite', price: 0, duration: '' },
      { id: 'pack-site', category: "Créer avec l'IA, sans savoir coder", label: 'Pack Site internet', description: 'Votre propre site pour présenter votre activité', price: 0, duration: '' },
      { id: 'pack-app', category: "Créer avec l'IA, sans savoir coder", label: 'Pack Application', description: 'Votre propre application pour téléphone ou ordinateur', price: 0, duration: '' },
      { id: 'pack-agents', category: "Créer avec l'IA, sans savoir coder", label: 'Pack Assistant IA', description: 'Un assistant qui répond à vos clients sur WhatsApp, jour et nuit', price: 0, duration: '' },
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
  // Coaching présentiel (formation en petit groupe). Les sessions (dates, lieux,
  // places) sont en base ; ici, uniquement les textes de la page.
  inPerson: {
    enabled: true,
    title: 'Formation IA & Montage Vidéo',
    subtitle: "Filmez, montez et utilisez l'IA comme un pro, depuis votre smartphone. 3 jours en présentiel, en petit groupe.",
    price: 13000,   // prix de la formation (DA) — repris par défaut pour chaque session
    oldPrice: 18000, // prix barré affiché à côté (offre de lancement) ; 0 = pas de prix barré
    deposit: 3000,  // acompte obligatoire pour réserver sa place
    // Titres courts : affichés en cartes compactes (2 par ligne sur téléphone).
    program: [
      'Filmer au smartphone',
      'Monter sur CapCut',
      'UGC & vidéos courtes',
      "Scripts avec l'IA",
      'Images & voix off IA',
      'Vos propres vidéos',
    ],
    // Étiquettes très courtes, en grille de 3 en haut de la page.
    infos: [
      '3 jours',
      'Petit groupe',
      '100 % mobile',
      'Débutants OK',
      '+100 formés',
      'Places limitées',
    ],
  },
  modules: {
    instructorEnabled: false,
    resourcesEnabled: false,
    // Redirige les visiteurs venus d'Instagram/TikTok/Facebook (navigateur
    // intégré) vers Chrome/Safari — voir InAppBrowserGuard côté frontend.
    inAppBrowserGuardEnabled: true
  }
}

// Réglages coaching enregistrés par une version antérieure : le contenu (sujets,
// formules, horaires, textes) repart des valeurs par défaut actuelles ; seuls les
// réglages propres à l'admin hors contenu sont conservés. Une seule fois : l'admin
// réenregistre ensuite avec la version courante.
const OLD_TOPIC_IDS = ['ia-chatgpt', 'ia-video', 'ia-textes', 'ia-images', 'ia-reseaux', 'ia-temps', 'creer-site', 'creer-page-vente', 'creer-outil', 'creer-app']
function upgradeCoaching(saved) {
  const def = defaultSettings.coaching
  if (!saved) return { ...def }
  if (saved.version === def.version) return { ...def, ...saved }
  // v5 → v6 : sujets remplacés par des packs. Le reste est conservé, et les
  // sujets ne sont remplacés que s'ils n'ont pas été personnalisés par l'admin.
  if (saved.version === 5) {
    const merged = { ...def, ...saved, version: def.version }
    if ((saved.topics || []).every(t => OLD_TOPIC_IDS.includes(t.id))) merged.topics = def.topics
    return merged
  }
  // v4 → v5 : séance possible à plusieurs. On garde tout ce que l'admin a saisi,
  // seuls les anciens textes par défaut (« individuel ») sont remplacés.
  if (saved.version === 4) {
    const merged = { ...def, ...saved, version: def.version }
    if (saved.subtitle === "Un coach rien que pour vous, pour apprendre l'IA ou créer votre site.") merged.subtitle = def.subtitle
    if (JSON.stringify(saved.infos) === JSON.stringify(['2h30', 'En appel vidéo', 'Individuel', 'Débutants OK', '7 jours sur 7', 'Réponse rapide'])) merged.infos = def.infos
    return merged
  }
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
      const initial = { ...defaultSettings, settingsVersion: SETTINGS_VERSION }
      fs.writeFileSync(settingsPath, JSON.stringify(initial, null, 2))
      return initial
    }
    const data = fs.readFileSync(settingsPath, 'utf8')
    const parsed = JSON.parse(data)
    return migrateSettings(parsed, {
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
      inPerson: { ...defaultSettings.inPerson, ...(parsed.inPerson || {}) },
      // Liste vide = choix de l'admin ; liste sans id = ancien format, remplacé par les défauts
      upcomingCourses: Array.isArray(parsed.upcomingCourses) && (parsed.upcomingCourses.length === 0 || parsed.upcomingCourses.some(c => c.id))
        ? parsed.upcomingCourses
        : defaultSettings.upcomingCourses,
    })
  } catch (err) {
    console.error('Erreur lecture settings.json:', err)
    return defaultSettings
  }
}

// Réglages écrits par une version antérieure (le fichier est créé avec toutes
// les valeurs par défaut au premier démarrage, donc un simple changement de
// défaut ne l'atteint pas). Appliqué une fois : le prochain enregistrement admin
// écrit settingsVersion à jour.
const SETTINGS_VERSION = 4
const OLD_BANNER_TEXTS = ["🚀 Promo exceptionnelle : -50% sur toutes les formations ! Inscrivez-vous vite."]

function migrateSettings(parsed, merged) {
  if ((parsed.settingsVersion || 1) < 2) {
    if (!parsed.topBanner || OLD_BANNER_TEXTS.includes(parsed.topBanner.text)) {
      merged.topBanner = { ...defaultSettings.topBanner }
    }
    merged.modules = { ...merged.modules, instructorEnabled: false }
  }
  if ((parsed.settingsVersion || 1) < 3) {
    merged.modules = { ...merged.modules, resourcesEnabled: false }
  }
  if ((parsed.settingsVersion || 1) < 4 && /youtu\.?be/i.test(parsed.introVideoUrl || '')) {
    merged.introVideoUrl = defaultSettings.introVideoUrl
  }
  merged.settingsVersion = SETTINGS_VERSION
  return merged
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
