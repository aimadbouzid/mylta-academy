const fs = require('fs');
const path = require('path');

const newCombos = [
  {
    title: "Création de Shorts/Reels en masse",
    goal: "Générer des dizaines de vidéos courtes à partir de textes en quelques minutes.",
    tools: ["ChatGPT", "Canva", "Google Sheets"],
    steps: [
      "Demandez à ChatGPT de générer 30 citations ou faits intéressants.",
      "Collez ces données dans un tableau Google Sheets et téléchargez en CSV.",
      "Importez le CSV dans Canva via l'outil 'Création en bloc' pour générer 30 vidéos d'un coup."
    ],
    time: "20 min",
    cost: "0€ (Tout en gratuit)"
  },
  {
    title: "Podcast IA 100% Automatisé",
    goal: "Créer un podcast audio hyper-réaliste avec deux voix IA qui débattent.",
    tools: ["NotebookLM", "Spotify for Podcasters"],
    steps: [
      "Importez vos notes, PDF ou articles de blog dans Google NotebookLM.",
      "Générez un 'Audio Overview' pour obtenir un podcast réaliste de deux IA qui discutent de votre document.",
      "Publiez gratuitement l'audio sur Spotify for Podcasters."
    ],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Avatar Parlant Vidéo",
    goal: "Créer un présentateur IA qui lit votre texte sans montrer votre visage.",
    tools: ["Leonardo.ai", "SadTalker", "CapCut"],
    steps: [
      "Générez une image réaliste d'une personne avec Leonardo.ai.",
      "Utilisez l'extension SadTalker (HuggingFace/Local) pour animer le visage de l'image avec un fichier audio.",
      "Montez et ajoutez des sous-titres avec CapCut."
    ],
    time: "30 min",
    cost: "0€ (Open Source + Free Tiers)"
  },
  {
    title: "Clonage Vocal Parfait",
    goal: "Cloner votre propre voix pour doubler des vidéos sans devoir parler au micro.",
    tools: ["ElevenLabs", "Audacity"],
    steps: [
      "Enregistrez un échantillon clair de votre voix (1-2 minutes) avec Audacity.",
      "Uploadez l'échantillon sur ElevenLabs (Instant Voice Cloning).",
      "Générez de l'audio à l'infini avec votre propre voix en tapant simplement du texte."
    ],
    time: "15 min",
    cost: "Freemium (ou ~5€/mois)"
  },
  {
    title: "Création de Site E-Commerce Express",
    goal: "Lancer une boutique en ligne gratuite pour tester un produit.",
    tools: ["Ecwid", "Canva"],
    steps: [
      "Créez vos designs de produits et logos avec Canva.",
      "Créez un compte Ecwid gratuit (jusqu'à 5 produits sans frais d'abonnement).",
      "Connectez votre boutique à vos réseaux sociaux et commencez à vendre."
    ],
    time: "45 min",
    cost: "0€ (+ frais de transaction)"
  },
  {
    title: "Newsletter Automatisée IA",
    goal: "Lancer une newsletter professionnelle rédigée en partie par l'IA.",
    tools: ["Perplexity", "Substack"],
    steps: [
      "Faites une recherche approfondie sur un sujet de niche avec Perplexity AI pour obtenir des sources fiables.",
      "Demandez à Claude ou ChatGPT de synthétiser la recherche en format newsletter.",
      "Publiez et monétisez gratuitement avec Substack."
    ],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Générateur d'Idées de Business",
    goal: "Trouver une idée de business rentable et créer un plan d'action.",
    tools: ["Phind", "Notion IA"],
    steps: [
      "Cherchez des tendances de marché pour développeurs ou entrepreneurs avec Phind.",
      "Utilisez les templates Notion pour structurer votre business model canvas.",
      "Aidez-vous de l'IA de Notion pour brainstormer le nom et les offres."
    ],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Résumé de Vidéos YouTube Longues",
    goal: "Extraire le jus d'une vidéo d'une heure en 2 minutes de lecture.",
    tools: ["YouTube Transcript", "Claude 3.5"],
    steps: [
      "Copiez le script de la vidéo YouTube via des extensions gratuites ou le bouton Transcript.",
      "Collez le texte massif dans Claude 3.5 Sonnet (qui a une grande fenêtre de contexte).",
      "Demandez un résumé en bullet points et des plans d'action concrets."
    ],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Traduction de Vidéos Virales",
    goal: "Traduire vos vidéos dans 10 langues différentes avec la même voix.",
    tools: ["CapCut", "ElevenLabs (Optionnel)"],
    steps: [
      "Importez votre vidéo sur CapCut Desktop.",
      "Utilisez la fonction 'Auto-Translate' pour traduire les sous-titres.",
      "Générez les voix de synthèse dans la nouvelle langue directement via CapCut."
    ],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Génération de Musiques Libres de Droits",
    goal: "Créer une bande son originale pour vos vidéos ou jeux.",
    tools: ["Suno AI", "CapCut"],
    steps: [
      "Entrez un prompt décrivant l'humeur et le genre musical sur Suno.com.",
      "Téléchargez le MP3 généré (2 chansons gratuites par jour).",
      "Ajoutez-le en fond sonore sur CapCut."
    ],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Création de Pitch Deck (Présentation)",
    goal: "Créer des slides magnifiques pour présenter un projet ou une startup.",
    tools: ["Gamma.app", "Unsplash"],
    steps: [
      "Tapez simplement l'idée de votre projet sur Gamma.app.",
      "L'IA génère les textes, la structure et le design complet des 10 slides.",
      "Personnalisez les images avec la banque Unsplash intégrée."
    ],
    time: "10 min",
    cost: "0€ (Freemium)"
  },
  {
    title: "Rédaction d'Articles SEO",
    goal: "Ecrire un article de blog optimisé pour se classer sur Google.",
    tools: ["ChatGPT", "Google Keyword Planner"],
    steps: [
      "Trouvez un mot-clé pertinent et gratuit via Google Keyword Planner.",
      "Demandez à ChatGPT de rédiger un article structuré avec des balises H2, H3.",
      "Relisez et ajoutez votre touche personnelle."
    ],
    time: "25 min",
    cost: "0€"
  },
  {
    title: "Application Mobile Sans Code",
    goal: "Créer une app pour votre business sans savoir coder.",
    tools: ["Glide", "Google Sheets"],
    steps: [
      "Créez la base de données de votre app dans un simple fichier Google Sheets.",
      "Connectez-le à Glide Apps.",
      "L'interface de l'application est générée automatiquement et publiée sous forme d'app PWA."
    ],
    time: "1 heure",
    cost: "0€ (Plan gratuit)"
  },
  {
    title: "Automatisation Instagram (Bot MP)",
    goal: "Envoyer un lien automatiquement à tous ceux qui commentent votre Reel.",
    tools: ["ManyChat", "Instagram"],
    steps: [
      "Connectez ManyChat à votre compte Instagram Pro.",
      "Créez un flux: 'Si le commentaire contient [MOT]', envoyer un Message Privé.",
      "Demandez à l'audience de commenter pour recevoir votre ressource gratuite."
    ],
    time: "15 min",
    cost: "0€ (Jusqu'à 1000 contacts)"
  },
  {
    title: "Web Scraping (Extraction de données)",
    goal: "Extraire tous les contacts ou produits d'un site web.",
    tools: ["Apify", "Google Sheets"],
    steps: [
      "Trouvez un scraper gratuit sur le store d'Apify (ex: Instagram Scraper).",
      "Laissez l'outil tourner sur le profil cible.",
      "Exportez les résultats en CSV et nettoyez-les dans Google Sheets."
    ],
    time: "20 min",
    cost: "0€ (Crédits de départ)"
  },
  {
    title: "Création de CV Parfait",
    goal: "Refaire son CV pour décrocher n'importe quel job.",
    tools: ["ChatGPT", "Canva"],
    steps: [
      "Donnez votre CV actuel et l'offre d'emploi à ChatGPT. Demandez d'optimiser les mots-clés.",
      "Prenez le texte généré et insérez-le dans un template moderne sur Canva.",
      "Exportez en PDF."
    ],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Miniatures YouTube Virales",
    goal: "Faire des miniatures au style MrBeast avec un fort taux de clic.",
    tools: ["Photopea", "Leonardo.ai", "Remove.bg"],
    steps: [
      "Générez un fond hyper coloré et intrigant avec Leonardo.ai.",
      "Prenez une photo de vous très expressive, et détourez-la avec Remove.bg.",
      "Assemblez et ajoutez du contraste/texte sur Photopea (le Photoshop web gratuit)."
    ],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Création de Fiches Produits",
    goal: "Traduire et améliorer des fiches produits Aliexpress/Amazon.",
    tools: ["DeepL", "ChatGPT"],
    steps: [
      "Copiez la fiche produit basique ou étrangère.",
      "Traduisez avec DeepL si besoin pour une traduction naturelle.",
      "Demandez à ChatGPT d'appliquer un framework de Copywriting (AIDA) sur le produit."
    ],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Photos Produits Pro",
    goal: "Créer des packshots dignes d'un studio professionnel pour du e-commerce.",
    tools: ["Photoroom"],
    steps: [
      "Prenez votre produit en photo avec votre téléphone (même sur une table moche).",
      "Importez-le dans l'application Photoroom.",
      "L'IA détoure le produit et génère un fond studio réaliste (ombres incluses)."
    ],
    time: "3 min",
    cost: "0€ (Avec watermark facile à enlever)"
  },
  {
    title: "Bot Service Client IA",
    goal: "Créer un chatbot qui répond aux questions de vos clients 24/7.",
    tools: ["Botpress", "ChatGPT"],
    steps: [
      "Créez un compte Botpress (Gratuit).",
      "Fournissez le lien de votre site web ou une FAQ PDF pour que le bot s'entraîne dessus.",
      "Intégrez le code widget sur votre site web."
    ],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Montage Vidéo Dynamique Automatique",
    goal: "Découper de longues interviews en dizaines de Shorts viraux.",
    tools: ["Opus Clip"],
    steps: [
      "Collez le lien YouTube d'un long podcast sur Opus Clip.",
      "L'IA analyse les moments les plus intéressants et génère des extraits courts.",
      "Les sous-titres dynamiques et les zooms sont ajoutés automatiquement."
    ],
    time: "10 min",
    cost: "Freemium (Crédits gratuits mensuels)"
  },
  {
    title: "Planification de Contenu",
    goal: "Programmer 1 mois de posts sur tous les réseaux.",
    tools: ["Notion", "Metricool"],
    steps: [
      "Préparez et rédigez vos posts dans un calendrier Notion.",
      "Connectez Metricool à vos réseaux sociaux (gratuit jusqu'à 50 posts/mois).",
      "Copiez/collez et planifiez les dates."
    ],
    time: "2 heures",
    cost: "0€"
  },
  {
    title: "Création de Lead Magnets (E-book)",
    goal: "Créer un PDF gratuit à offrir en échange d'emails.",
    tools: ["ChatGPT", "Canva"],
    steps: [
      "Structurez un petit guide 'Comment faire X en 3 étapes' avec ChatGPT.",
      "Trouvez un template de E-book ou présentation sur Canva.",
      "Mettez en page et ajoutez des visuels gratuits."
    ],
    time: "45 min",
    cost: "0€"
  },
  {
    title: "Veille Concurrentielle",
    goal: "Savoir tout ce que vos concurrents publient.",
    tools: ["Feedly", "Google Alerts"],
    steps: [
      "Configurez Google Alerts sur le nom de vos concurrents.",
      "Ajoutez les blogs de votre secteur dans Feedly.",
      "Lisez chaque matin un résumé des nouveautés."
    ],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Transcription de Réunions (Google Meet)",
    goal: "Avoir des comptes rendus de réunions parfaits sans rien noter.",
    tools: ["Otter.ai", "Fireflies.ai"],
    steps: [
      "Installez l'extension Chrome de Fireflies ou Otter.",
      "Connectez-vous à votre Google Meet / Zoom.",
      "L'IA participe, transcrit tout ce qui est dit et vous envoie un résumé par mail."
    ],
    time: "Automatique",
    cost: "0€ (Limites de base)"
  },
  {
    title: "Analyse de Données Complexes",
    goal: "Trouver des tendances dans vos ventes ou vos stats.",
    tools: ["ChatGPT Advanced Data Analysis", "Google Sheets"],
    steps: [
      "Exportez vos données de ventes, visites, ou finances en CSV.",
      "Uploadez le fichier dans ChatGPT (version gratuite limite à quelques messages).",
      "Demandez: 'Génère des graphiques et dis-moi quels produits performent le mieux'."
    ],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Création de Logos Génératifs",
    goal: "Avoir 100 idées de logos en 2 minutes.",
    tools: ["Bing Image Creator (DALL-E 3)"],
    steps: [
      "Utilisez Bing Image Creator (gratuit).",
      "Entrez : 'A minimalist vector logo for a coffee shop named Bean, white background'.",
      "Répétez pour obtenir différentes variantes."
    ],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Organisation de Voyages/Déplacements",
    goal: "Créer un itinéraire parfait de A à Z.",
    tools: ["Perplexity", "Google Maps"],
    steps: [
      "Demandez à Perplexity: 'Fais un itinéraire de 3 jours à Rome pour un couple, budget moyen, avec les adresses et temps de trajet'.",
      "Enregistrez les adresses dans une liste Google Maps partagée.",
      "Profitez du voyage sans stress."
    ],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Révision de Contrats / Juridique basique",
    goal: "Comprendre les conditions d'un contrat obscur.",
    tools: ["Claude 3.5 Sonnet"],
    steps: [
      "Copiez/collez le contrat ou uploadez le PDF dans Claude.",
      "Demandez: 'Résume les obligations, les pièges potentiels et les dates clés de ce contrat de façon très simple'.",
      "Attention : l'IA ne remplace pas un avocat, mais c'est un bon premier filtre."
    ],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Amélioration de Prompts IA",
    goal: "Devenir un Prompt Engineer sans effort.",
    tools: ["PromptPerfect", "ChatGPT"],
    steps: [
      "Tapez une demande brouillon ('fais un poème sur la pluie').",
      "Demandez à ChatGPT: 'Agis comme un expert en Prompt Engineering, améliore mon prompt pour avoir le meilleur résultat possible.'",
      "Utilisez le nouveau prompt complexe généré."
    ],
    time: "2 min",
    cost: "0€"
  }
];

const filePath = path.join(__dirname, '..', 'src', 'data', 'resourcesData.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Find the export const freeCombosData = [...]
// We need to inject the 30 items before the closing bracket of that array.

const comboString = newCombos.map(c => `  {
    title: ${JSON.stringify(c.title)},
    goal: ${JSON.stringify(c.goal)},
    tools: ${JSON.stringify(c.tools)},
    steps: ${JSON.stringify(c.steps)},
    time: ${JSON.stringify(c.time)},
    cost: ${JSON.stringify(c.cost)}
  }`).join(',\\n');

// Replace the end of the array
const searchPattern = /  \}\n\]\n\n\nexport const masterclassCategories/g;
content = content.replace(searchPattern, `  },\n${comboString}\n]\n\n\nexport const masterclassCategories`);

fs.writeFileSync(filePath, content);
console.log('Successfully added 30 combos!');
