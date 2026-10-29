const fs = require('fs')
const { CURRICULUM, PROGRAM_SHORT } = require('./curriculum')
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
    subtitle: "L'IA, la vidéo et le web, en pratique. En ligne ou à Béjaïa."
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
      id: 'prompt-engineering', title: "Prompt engineering : les bases pour bien travailler avec l'IA", category: 'IA', level: 'Débutant', duration: '',
      price: 3000, oldPrice: 5000,
      description: "Apprendre à parler à l'IA pour obtenir exactement ce que vous voulez, du premier coup.",
      program: [
        "Comprendre comment l'IA « pense » et ses limites",
        "La structure d'un bon prompt : rôle, contexte, tâche, format",
        'Donner des exemples pour guider la réponse',
        'Améliorer une réponse étape par étape',
        "Prompts pour écrire, résumer, traduire et analyser",
        'Créer sa bibliothèque de prompts réutilisables',
      ],
      included: ['Accès illimité', 'Modèles de prompts prêts à copier', 'Certificat de fin de formation'],
    },
    {
      id: 'ia-quotidien', title: "L'IA au quotidien : les outils à utiliser chaque jour", category: 'IA', level: 'Débutant', duration: '',
      price: 3000, oldPrice: 5000,
      description: "Les meilleurs outils IA, gratuits pour la plupart, pour gagner du temps chaque jour : écrire, chercher, créer, traduire, s'organiser.",
      program: [
        'ChatGPT, Gemini et Claude : les assistants pour tout faire',
        'Perplexity : chercher une information fiable en quelques secondes',
        "Canva IA et générateurs d'images : créer des visuels sans être designer",
        'Traduire, résumer et écrire ses messages avec l\'IA',
        "S'organiser : emails, planning et notes avec l'IA",
        "L'IA sur votre smartphone : les applications à installer",
      ],
      included: ['Accès illimité', 'Liste des outils avec les liens', 'Certificat de fin de formation'],
    },
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
    version: 7,
    enabled: false, // coaching en ligne : coupé, la priorité est au présentiel
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
      { id: 'vibe-coding', category: 'Débutant', label: 'Vibe Coding & Web Design', description: "Lovable · Bolt · Cursor — Créer des sites web professionnels, des landing pages, des portfolios et des interfaces modernes avec l'IA.", price: 0, duration: '' },
      { id: 'saas-dev', category: 'Débutant', label: 'SaaS & Application Development', description: 'Claude Code · Cursor · Lovable — Créer un véritable SaaS avec comptes utilisateurs, base de données, abonnement, paiement et tableau de bord.', price: 0, duration: '' },
      { id: 'ai-automation', category: 'Débutant', label: 'AI Automation & AI Agents', description: 'n8n · Make · APIs — Automatiser les tâches répétitives, connecter les outils, créer des agents IA et mettre en place des workflows intelligents.', price: 0, duration: '' },
      { id: 'mobile-apps', category: 'Débutant', label: 'Mobile Apps & Personal Software', description: "FlutterFlow · React Native · outils IA — Créer des applications mobiles, des outils personnels, des systèmes de gestion, des CRM et des applications pour organiser son travail.", price: 0, duration: '' },
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
  // Concours « gagnez une formation gratuite » : inscription sur /concours, tirage au sort dans l'admin.
  contest: {
    enabled: false, // concours « formation gratuite » : coupé tant qu'aucun tirage n'est prévu
    title: 'Gagnez une formation gratuite !',
    text: "Tentez votre chance : une formation offerte, en présentiel ou en ligne. Tirage au sort parmi les inscrits.",
    prizes: ['Formation en présentiel', 'Coaching en ligne'],
    rules: [
      'Inscrivez-vous avec votre vrai numéro (une seule participation par numéro).',
      'Suivez Mylta Academy sur Instagram et partagez le concours en story.',
      'Le gagnant est tiré au sort et contacté sur WhatsApp.',
    ],
    endDate: '', // AAAA-MM-JJ : date du tirage (vide = non précisée)
  },
  // Formation accélérée d'un jour, chaque samedi matin, chez Viga Center (Béjaïa).
  express: {
    enabled: false, // formation d'un jour : coupée tant qu'aucune date n'est programmée
    title: 'Montage vidéo au smartphone en 1 jour',
    subtitle: "Formation accélérée : on filme le matin, on monte ensemble, et vous repartez avec votre vidéo terminée le jour même.",
    price: 6000,
    deposit: 2000,
    weekday: 6,          // 6 = samedi
    startTime: '09:00',
    endTime: '13:00',
    capacity: 12,        // places par samedi
    weeksAhead: 6,       // nombre de samedis proposés
    closedDates: [],     // samedis sans formation (AAAA-MM-JJ)
    place: 'Viga Center — Learning & Coaching',
    address: 'Bd des Frères Ouakouche, Béjaïa',
    schedule: [
      { time: '09:00', label: 'Accueil et les bases : cadrage, lumière, son' },
      { time: '09:40', label: 'Tournage : chacun filme sa propre vidéo' },
      { time: '10:45', label: 'Pause café' },
      { time: '11:00', label: 'Montage accéléré sur CapCut : coupes, rythme, transitions' },
      { time: '12:00', label: 'Sous-titres, musique, effets et export' },
      { time: '12:40', label: 'Projection : chacun repart avec sa vidéo terminée' },
    ],
    results: ['Votre vidéo terminée, prête à publier', 'La méthode pour filmer et monter seul', 'Une attestation de participation'],
  },
  inPerson: {
    enabled: true,
    title: 'Formation IA & Montage Vidéo',
    subtitle: "Filmez, montez et utilisez l'IA comme un pro, depuis votre smartphone. 3 jours en présentiel, en petit groupe.",
    price: 22000,   // prix de la formation (DA) — repris par défaut pour chaque session
    studentPrice: 0, // tarif étudiant (carte étudiante obligatoire) ; 0 = pas de tarif étudiant
    oldPrice: 0, // prix barré affiché à côté (offre de lancement) ; 0 = pas de prix barré
    deposit: 3000,  // acompte obligatoire pour réserver sa place
    // Message affiché au-dessus des sessions (vide = rien) : utile tant que les dates ne sont pas définitives.
    datesNotice: "Session unique : les 12, 13 et 14 novembre 2026. Les places partent vite.",
    showSeats: false,
    joinCode: '', // code secret du QR d'inscription sur place (vide = QR désactivé) // afficher « il reste N places » sur les sessions (désactivé par défaut)
    // Titres courts : affichés en cartes compactes (2 par ligne sur téléphone).
    program: PROGRAM_SHORT,
    // Programme détaillé jour par jour, en français, anglais et arabe.
    curriculum: CURRICULUM,
    // Récapitulatif montré une fois la date choisie : programme, date et lieu
    // sous les yeux avant de remplir le profil et les coordonnées.
    recapEnabled: true,
    venue: 'Camden International Institute',
    venueAddress: 'Cité Douanière Bir Slam, Promo Ceram Bt D1 W, Béjaïa',
    // Étiquettes très courtes, en grille de 3 en haut de la page.
    infos: [
      '3 jours',
      'Petit groupe',
      '100 % mobile',
      'Débutants OK',
      '+170 formés',
      'Places limitées',
    ],
  },
  // Message posé au visiteur dès son arrivée sur l'accueil.
  welcome: {
    enabled: true,
    title: 'Choisissez votre formation',
    subtitle: "Trois façons d'apprendre. Laquelle vous va ?",
    // Proposer de laisser ses coordonnées quand aucune date ne convient.
    notifyEnabled: true,
  },
  // Message affiché aux visiteurs à leur arrivée sur le site, puis masqué
  // automatiquement au bout de 5 secondes (une fois par visite).
  welcomeMessage: {
    enabled: true,
    text: 'Bienvenue sur Mylta Academy 👋',
  },
  modules: {
    instructorEnabled: false,
    resourcesEnabled: false,
    // Bandeau de consentement aux cookies : désactivé par défaut.
    cookieBannerEnabled: false,
    // Redirige les visiteurs venus d'Instagram/TikTok/Facebook (navigateur
    // intégré) vers Chrome/Safari — voir InAppBrowserGuard côté frontend.
    inAppBrowserGuardEnabled: true,
    // Bandeau « Formations gratuites à l'université de Béjaïa » sur l'accueil.
    clubBannerEnabled: false
  }
}

// Réglages coaching enregistrés par une version antérieure : le contenu (sujets,
// formules, horaires, textes) repart des valeurs par défaut actuelles ; seuls les
// réglages propres à l'admin hors contenu sont conservés. Une seule fois : l'admin
// réenregistre ensuite avec la version courante.
const V6_TOPIC_IDS = ['pack-createur', 'pack-avatar', 'pack-productivite', 'pack-site', 'pack-app', 'pack-agents']
const OLD_TOPIC_IDS = ['ia-chatgpt', 'ia-video', 'ia-textes', 'ia-images', 'ia-reseaux', 'ia-temps', 'creer-site', 'creer-page-vente', 'creer-outil', 'creer-app']
function upgradeCoaching(saved) {
  const def = defaultSettings.coaching
  if (!saved) return { ...def }
  if (saved.version === def.version) return { ...def, ...saved }
  // v6 → v7 : les packs laissent place aux quatre formations. Les sujets ne sont
  // remplacés que si l'admin ne les a pas personnalisés.
  if (saved.version === 6) {
    const merged = { ...def, ...saved, version: def.version }
    if ((saved.topics || []).every(t => V6_TOPIC_IDS.includes(t.id))) merged.topics = def.topics
    return merged
  }
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

// Cache mémoire des réglages. `/api/config/site` est appelé à chaque chargement
// de page par chaque visiteur : sans cache, chaque appel faisait une lecture
// disque SYNCHRONE (readFileSync + JSON.parse + fusion profonde), qui bloque
// l'unique fil d'exécution de Node. Quelques centaines de visiteurs simultanés
// — ou un simple script — suffisaient à figer toute l'API.
// Le cache est invalidé par la date de modification du fichier, donc une
// modification faite à la main sur settings.json est prise en compte elle aussi.
let settingsCache = null
let settingsCacheMtime = 0

function invalidateSettingsCache() {
  settingsCache = null
  settingsCacheMtime = 0
}

function getSettings() {
  try {
    if (settingsCache) {
      let mtime = 0
      try { mtime = fs.statSync(settingsPath).mtimeMs } catch { /* fichier absent : on relit */ }
      if (mtime && mtime === settingsCacheMtime) return settingsCache
    }
    return (settingsCache = readSettingsFromDisk())
  } catch (err) {
    console.error('Erreur lecture settings.json:', err)
    return defaultSettings
  }
}

function readSettingsFromDisk() {
  try {
    if (!fs.existsSync(settingsPath)) {
      const dir = path.dirname(settingsPath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const initial = { ...defaultSettings, settingsVersion: SETTINGS_VERSION }
      fs.writeFileSync(settingsPath, JSON.stringify(initial, null, 2))
      try { settingsCacheMtime = fs.statSync(settingsPath).mtimeMs } catch { settingsCacheMtime = 0 }
      return initial
    }
    const data = fs.readFileSync(settingsPath, 'utf8')
    const parsed = JSON.parse(data)
    const result = migrateSettings(parsed, {
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
      welcomeMessage: { ...defaultSettings.welcomeMessage, ...(parsed.welcomeMessage || {}) },
      coaching: upgradeCoaching(parsed.coaching),
      inPerson: {
        ...defaultSettings.inPerson,
        ...(parsed.inPerson || {}),
        curriculum: { ...defaultSettings.inPerson.curriculum, ...(parsed.inPerson?.curriculum || {}) },
      },
      contest: { ...defaultSettings.contest, ...(parsed.contest || {}) },
      welcome: { ...defaultSettings.welcome, ...(parsed.welcome || {}) },
      express: { ...defaultSettings.express, ...(parsed.express || {}) },
      // Liste vide = choix de l'admin ; liste sans id = ancien format, remplacé par les défauts
      upcomingCourses: Array.isArray(parsed.upcomingCourses) && (parsed.upcomingCourses.length === 0 || parsed.upcomingCourses.some(c => c.id))
        ? parsed.upcomingCourses
        : defaultSettings.upcomingCourses,
    })
    try { settingsCacheMtime = fs.statSync(settingsPath).mtimeMs } catch { settingsCacheMtime = 0 }
    return result
  } catch (err) {
    console.error('Erreur lecture settings.json:', err)
    return defaultSettings
  }
}

// Réglages écrits par une version antérieure (le fichier est créé avec toutes
// les valeurs par défaut au premier démarrage, donc un simple changement de
// défaut ne l'atteint pas). Appliqué une fois : le prochain enregistrement admin
// écrit settingsVersion à jour.
const SETTINGS_VERSION = 15
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
  if ((parsed.settingsVersion || 1) < 5) {
    merged.inPerson = { ...merged.inPerson, price: 13000, oldPrice: 14000, studentPrice: 10000 }
  }
  if ((parsed.settingsVersion || 1) < 6 && Array.isArray(merged.upcomingCourses)) {
    // Nouvelle formation « prompt engineering » + « IA au quotidien » recentrée sur les outils
    // (remplacée seulement si l'admin ne l'avait pas modifiée).
    const byId = Object.fromEntries(defaultSettings.upcomingCourses.map(c => [c.id, c]))
    let list = merged.upcomingCourses.map(c =>
      c.id === 'ia-quotidien' && c.title === "L'IA au quotidien : ChatGPT et les outils IA" ? byId['ia-quotidien'] : c)
    if (!list.some(c => c.id === 'prompt-engineering')) list = [byId['prompt-engineering'], ...list]
    merged.upcomingCourses = list
  }
  if ((parsed.settingsVersion || 1) < 7 && Number(merged.inPerson?.oldPrice) === 14000) {
    merged.inPerson = { ...merged.inPerson, oldPrice: 16000 }
  }
  if ((parsed.settingsVersion || 1) < 8 && merged.inPerson?.datesNotice === "Inscriptions ouvertes ! Le calendrier exact des sessions vous sera communiqué d'ici 2 à 4 jours.") {
    merged.inPerson = { ...merged.inPerson, datesNotice: defaultSettings.inPerson.datesNotice }
  }
  if ((parsed.settingsVersion || 1) < 11 && [
    "Du dimanche au jeudi chez Camden à Béjaïa, 3 jours de suite : le matin (8h30 – 12h30) ou l'après-midi (15h – 18h).",
    "Du dimanche au jeudi chez Camden à Béjaïa, 3 jours de suite : le matin (8h30 – 12h30) ou l'après-midi (16h – 19h).",
    "Inscriptions ouvertes ! Le calendrier exact des sessions vous sera communiqué d'ici 2 à 4 jours.",
    'Du dimanche au jeudi, de 8h30 à 12h30, chez Camden à Béjaïa : 3 matinées de suite.',
  ].includes(merged.inPerson?.datesNotice)) {
    merged.inPerson = { ...merged.inPerson, datesNotice: defaultSettings.inPerson.datesNotice }
  }
  if ((parsed.settingsVersion || 1) < 12) {
    // Session unique des 12-14 novembre 2026 : nouveau tarif, programme détaillé,
    // et formation d'un jour coupée faute de date programmée.
    merged.inPerson = {
      ...merged.inPerson,
      price: 22000,
      studentPrice: 0,
      oldPrice: 0,
      program: PROGRAM_SHORT,
      curriculum: CURRICULUM,
      datesNotice: defaultSettings.inPerson.datesNotice,
      infos: defaultSettings.inPerson.infos,
    }
    merged.express = { ...merged.express, enabled: false }
  }
  if ((parsed.settingsVersion || 1) < 13) {
    merged.modules = { ...merged.modules, clubBannerEnabled: false }
  }
  if ((parsed.settingsVersion || 1) < 14) {
    merged.coaching = { ...merged.coaching, enabled: false }
    merged.contest = { ...merged.contest, enabled: false }
  }
  if ((parsed.settingsVersion || 1) < 15) {
    // Programme réécrit : chaque point devient un titre court suivi d'un détail.
    merged.inPerson = { ...merged.inPerson, curriculum: CURRICULUM }
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
    invalidateSettingsCache()
    return updated
  } catch (err) {
    console.error('Erreur écriture settings.json:', err)
    throw err
  }
}

module.exports = { getSettings, updateSettings, invalidateSettingsCache }
