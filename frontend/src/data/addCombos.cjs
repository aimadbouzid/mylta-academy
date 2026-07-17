const fs = require('fs');

const newCombos = [
  { title: "Générateur de Shorts Automatique", goal: "Créer 100 Shorts en 1h.", tools: ["ChatGPT", "Canva", "ElevenLabs"], steps: ["Générez des faits intéressants avec ChatGPT.", "Copiez-les dans Canva avec l'outil de création en vrac.", "Ajoutez une voix ElevenLabs."], time: "60 min", cost: "0€" },
  { title: "Résumé de Podcast Viral", goal: "Créer des extraits TikTok de podcast.", tools: ["Opus Clip", "YouTube"], steps: ["Prenez le lien d'un podcast populaire.", "Collez-le dans Opus Clip.", "L'IA génère 10 clips viraux avec sous-titres."], time: "10 min", cost: "0€ (essai)" },
  { title: "Cloneur de Voix pour Faceless", goal: "Faire parler n'importe qui.", tools: ["ElevenLabs", "D-ID", "Midjourney"], steps: ["Générez une image sur Midjourney.", "Clonez une voix sur ElevenLabs.", "Animez le visage avec D-ID."], time: "15 min", cost: "0€ (essai)" },
  { title: "Bot de Vente Instagram", goal: "Vendre automatiquement en DM.", tools: ["ManyChat", "ChatGPT", "Instagram"], steps: ["Créez un Reel qui dit 'Commente X'.", "Configurez ManyChat pour répondre au mot clé.", "Le bot envoie le lien d'affiliation."], time: "20 min", cost: "0€" },
  { title: "Boutique E-commerce IA", goal: "Créer un shop complet sans effort.", tools: ["Shopify", "ChatGPT", "Midjourney"], steps: ["Trouvez la niche avec ChatGPT.", "Générez les logos et bannières avec Midjourney.", "Rédigez les fiches produits avec l'IA."], time: "45 min", cost: "0€" },
  { title: "Création de Musique Lo-Fi", goal: "Générer une chaîne YouTube musicale 24/7.", tools: ["Suno AI", "Leonardo.ai", "CapCut"], steps: ["Générez la musique sur Suno AI.", "Créez une animation en boucle sur Leonardo.", "Montez une vidéo d'1h sur CapCut."], time: "30 min", cost: "0€" },
  { title: "Devenir Freelance Copywriter", goal: "Rédiger des pages de vente sans être pro.", tools: ["Claude 3.5 Sonnet", "Google Docs"], steps: ["Trouvez un client.", "Utilisez Claude pour écrire avec le framework PAS.", "Livrez le texte formaté sur Google Docs."], time: "25 min", cost: "0€" },
  { title: "Traduire des Vidéos YouTube", goal: "Toucher l'audience internationale.", tools: ["HeyGen", "YouTube"], steps: ["Téléchargez votre vidéo française.", "Uploadez sur HeyGen pour traduire en anglais (clonage vocal et labial).", "Publiez sur une chaîne US."], time: "15 min", cost: "0€" },
  { title: "Création d'E-book Automatique", goal: "Vendre un E-book sur Amazon KDP.", tools: ["ChatGPT", "Canva", "Amazon KDP"], steps: ["Générez les chapitres avec ChatGPT.", "Mettez en page sur un template Canva.", "Publiez gratuitement sur Kindle Direct Publishing."], time: "2h", cost: "0€" },
  { title: "Analyse SEO des Concurrents", goal: "Voler le trafic des concurrents.", tools: ["Ubersuggest", "ChatGPT", "WordPress"], steps: ["Analysez les mots clés du concurrent sur Ubersuggest.", "Demandez à ChatGPT d'écrire un article 2x plus long.", "Publiez sur votre blog."], time: "30 min", cost: "0€" },
  { title: "Générateur de Posts LinkedIn", goal: "Devenir Top Voice LinkedIn.", tools: ["Taplio", "Claude", "LinkedIn"], steps: ["Trouvez les posts viraux sur Taplio.", "Réécrivez-les avec votre propre style via Claude.", "Programmez vos posts pour le mois."], time: "20 min", cost: "0€" },
  { title: "Assistant Service Client IA", goal: "Remplacer le SAV.", tools: ["Chatbase", "Site Web"], steps: ["Importez les documents de votre site sur Chatbase.", "L'IA apprend toutes vos infos.", "Intégrez le chatbot sur votre site en 1 clic."], time: "10 min", cost: "0€" },
  { title: "Veille Concurrentielle Automatisée", goal: "Savoir ce que font les autres.", tools: ["Feedly", "ChatGPT", "Slack"], steps: ["Ajoutez les blogs concurrents sur Feedly.", "Utilisez Zapier pour envoyer les nouveaux articles à ChatGPT.", "Recevez un résumé sur Slack."], time: "15 min", cost: "0€" },
  { title: "Création de Logos en Masse", goal: "Vendre des logos sur Fiverr.", tools: ["Midjourney", "Vectorize.ai"], steps: ["Générez des logos sur Midjourney.", "Vectorisez-les gratuitement.", "Vendez-les à vos clients 50€ pièce."], time: "10 min", cost: "0€" },
  { title: "Newsletter Curated Auto", goal: "Créer une newsletter comme Morning Brew.", tools: ["Beehiiv", "Perplexity"], steps: ["Demandez à Perplexity les 5 grosses actus du jour.", "Reformulez avec un ton amusant.", "Envoyez sur Beehiiv (gratuit jusqu'à 2500 subs)."], time: "15 min", cost: "0€" },
  { title: "Création de Présentation Pitch Deck", goal: "Lever des fonds ou vendre un service.", tools: ["Gamma.app", "ChatGPT"], steps: ["Écrivez le plan avec ChatGPT.", "Collez le texte dans Gamma.", "L'IA génère les slides, images et design instantanément."], time: "5 min", cost: "0€" },
  { title: "Automatisation de Prospection B2B", goal: "Trouver des clients en dormant.", tools: ["Apollo.io", "Lemlist", "ChatGPT"], steps: ["Scrappez 1000 emails sur Apollo.", "Écrivez une séquence avec ChatGPT.", "Lancez la campagne sur Lemlist."], time: "40 min", cost: "0€" },
  { title: "Créateur de CV Parfait", goal: "Trouver un emploi rapidement.", tools: ["Canva", "ChatGPT"], steps: ["Prenez l'offre d'emploi.", "Demandez à ChatGPT d'optimiser votre CV pour cette offre (mots clés).", "Utilisez un beau template Canva."], time: "15 min", cost: "0€" },
  { title: "Génération de Code Python", goal: "Créer des scripts sans savoir coder.", tools: ["Cursor", "Python"], steps: ["Ouvrez Cursor Editor.", "Appuyez sur Cmd+K et demandez 'un script de scraping web'.", "Exécutez le code généré directement."], time: "5 min", cost: "0€" },
  { title: "Création d'Application Mobile", goal: "Créer une app iOS/Android sans code.", tools: ["FlutterFlow", "Firebase"], steps: ["Dessinez l'interface sur FlutterFlow.", "Générez la base de données Firebase en 1 clic.", "Publiez sur les stores."], time: "3h", cost: "0€" },
  { title: "Création de Formations en Ligne", goal: "Lancer un cours vidéo.", tools: ["Notion", "Tella.tv", "Systeme.io"], steps: ["Écrivez le plan sur Notion.", "Enregistrez votre écran avec Tella.", "Hébergez et vendez sur Systeme.io gratuitement."], time: "2h", cost: "0€" },
  { title: "Générateur d'Histoires pour Enfants", goal: "Vendre des livres illustrés.", tools: ["ChatGPT", "Midjourney", "Amazon KDP"], steps: ["Écrivez l'histoire avec ChatGPT.", "Générez les illustrations style Pixar avec Midjourney.", "Publiez le livre."], time: "2h", cost: "0€" },
  { title: "Automatisation Instagram Complète", goal: "Gérer un compte de niche auto.", tools: ["Make.com", "ChatGPT", "Instagram"], steps: ["Make récupère l'actu du jour.", "ChatGPT crée un post et image.", "Make publie sur Instagram. Tout en automatique."], time: "1h", cost: "0€" },
  { title: "Assistant Comptable Personnel", goal: "Gérer ses finances intelligemment.", tools: ["ChatGPT Data Analysis", "Excel"], steps: ["Exportez vos relevés bancaires.", "Importez-les dans ChatGPT.", "Demandez une analyse de vos dépenses inutiles."], time: "10 min", cost: "0€" },
  { title: "Génération de Quiz Viraux", goal: "Créer du contenu interactif.", tools: ["Interact", "ChatGPT"], steps: ["Générez des questions psychologiques avec ChatGPT.", "Mettez-les sur Interact.", "Récoltez des milliers d'emails via le quiz."], time: "20 min", cost: "0€" },
  { title: "Création de Voix Off Documentaire", goal: "Faire des vidéos style Netflix.", tools: ["ElevenLabs", "CapCut"], steps: ["Écrivez le script du docu.", "Utilisez une voix grave (ex: Marcus) sur ElevenLabs.", "Ajoutez des musiques épiques sur CapCut."], time: "30 min", cost: "0€" },
  { title: "Traduire un Site Web Entier", goal: "Passer à l'international.", tools: ["Weglot", "ChatGPT"], steps: ["Installez Weglot sur votre site (trad auto).", "Réparez les petites erreurs avec ChatGPT.", "Attirez des clients du monde entier."], time: "15 min", cost: "0€" },
  { title: "Création d'Art IA", goal: "Vendre des posters sur Etsy.", tools: ["Midjourney", "Printify", "Etsy"], steps: ["Générez des toiles abstraites sur Midjourney.", "Placez-les sur des posters via Printify.", "Listez-les sur Etsy sans gérer les stocks."], time: "45 min", cost: "0€" },
  { title: "Résumé de Vidéo en PDF", goal: "Créer un lead magnet rapidement.", tools: ["YouTube", "ChatGPT", "Canva"], steps: ["Copiez le transcript YouTube.", "Demandez un résumé propre à ChatGPT.", "Créez un PDF sur Canva pour récolter des emails."], time: "15 min", cost: "0€" },
  { title: "Rédaction de Poésie/Chansons", goal: "Créer de l'art écrit.", tools: ["ChatGPT", "Suno AI"], steps: ["Générez des paroles émotionnelles avec ChatGPT.", "Importez-les dans Suno AI pour créer la chanson.", "Publiez sur Spotify via un distributeur."], time: "20 min", cost: "0€" }
];

let content = fs.readFileSync('/Users/aimadbouzidi/Downloads/7sab /myAcademy/frontend/src/data/resourcesData.js', 'utf8');
const searchString = `    cost: "0€"\n  }\n]`;
const insertString = ",\n" + newCombos.map(c => `  {
    title: ${JSON.stringify(c.title)},
    goal: ${JSON.stringify(c.goal)},
    tools: ${JSON.stringify(c.tools)},
    steps: ${JSON.stringify(c.steps)},
    time: ${JSON.stringify(c.time)},
    cost: ${JSON.stringify(c.cost)}
  }`).join(",\n") + "\n]";

content = content.replace(searchString, searchString.replace("\n]", "") + insertString);
fs.writeFileSync('/Users/aimadbouzidi/Downloads/7sab /myAcademy/frontend/src/data/resourcesData.js', content);
console.log("Combos added successfully!");
