export const promptsCategories = [
  {
    id: "marketing",
    name: "Marketing & Vente",
    prompts: [
      {
        title: "Générateur de Page de Vente AIDA",
        prompt: "Agis comme un copywriter expert. Rédige une page de vente complète en utilisant le framework AIDA (Attention, Intérêt, Désir, Action) pour vendre [TON PRODUIT]. La cible est [TA CIBLE]. Le ton doit être persuasif, urgent mais pas agressif."
      },
      {
        title: "Séquence d'Emails d'Onboarding",
        prompt: "Crée une séquence de 5 emails de bienvenue pour les nouveaux inscrits à mon outil SaaS [NOM OUTIL]. L'email 1 est l'accueil, l'email 2 montre un cas d'usage, l'email 3 donne un hack de productivité, l'email 4 introduit l'offre payante, l'email 5 est le FOMO/Urgence."
      },
      {
        title: "Scripts Publicitaires Facebook Ads",
        prompt: "Donne-moi 3 scripts différents pour une publicité vidéo Facebook Ads d'une durée de 30 secondes. Produit : [PRODUIT]. Le script 1 doit cibler la douleur (Pain), le script 2 doit être un témoignage client fictif, et le script 3 doit montrer un 'Avant/Après'."
      },
      {
        title: "Créer un Avatar Client (Persona)",
        prompt: "Construis un persona marketing ultra-détaillé pour mon entreprise qui vend [PRODUIT]. Inclus son nom, son âge, son salaire, ses frustrations profondes, ses désirs inavoués, ce qu'il déteste dans les solutions actuelles, et ses marques préférées."
      },
      {
        title: "Générer une Offre Irrésistible (Hormozi)",
        prompt: "Utilise le framework de la 'Grand Slam Offer' d'Alex Hormozi pour mon service de [SERVICE]. Aide-moi à définir : 1. Le résultat de rêve, 2. La probabilité de réussite perçue, 3. Le temps nécessaire, 4. L'effort et le sacrifice. Propose 3 bonus inédits pour augmenter la valeur."
      },
      {
        title: "Pitch de Vente (Elevator Pitch)",
        prompt: "Rédige 3 'Elevator Pitches' de 30 secondes pour présenter ma startup [NOM STARTUP] qui aide [CIBLE] à [SOLUTION]. Je veux une version très technique pour les investisseurs, et une version simplifiée (comme pour un enfant de 10 ans)."
      },
      {
        title: "Framework PAS (Problem, Agitate, Solve)",
        prompt: "Écris une landing page courte en utilisant le format PAS. Produit : [PRODUIT]. Douleur principale : [DOULEUR]. Agite le problème en montrant les conséquences dramatiques de ne rien faire, puis présente la solution de façon éclatante."
      },
      {
        title: "Générateur d'Objets d'Email (Taux d'ouverture)",
        prompt: "Génère 20 objets d'email très putaclics, curieux et persuasifs pour annoncer le lancement de mon nouveau produit : [PRODUIT]. Je veux un mélange de questions, d'urgence, et d'histoires personnelles."
      },
      {
        title: "Objections Clients & Réponses",
        prompt: "Liste les 10 objections les plus courantes que mes clients pourraient avoir avant d'acheter [MON PRODUIT] (prix, temps, confiance...). Rédige ensuite un argumentaire de réfutation implacable pour chacune de ces 10 objections."
      },
      {
        title: "Communiqué de Presse",
        prompt: "Rédige un communiqué de presse officiel et professionnel pour annoncer le lancement de [MON PROJET]. Il doit suivre les normes journalistiques, inclure une citation du fondateur, et avoir un titre accrocheur pour les journalistes Tech."
      },
      {
        title: "Script Cold Call (Appel à froid)",
        prompt: "Agis comme le Loup de Wall Street. Rédige un script d'appel à froid (Cold Call) pour vendre [PRODUIT] à des [CIBLE]. Le script doit avoir une accroche de 10 secondes pour briser la glace, une qualification rapide, et un traitement des 3 objections principales.",
        technique: "Le Pattern Interrupt : Casser le schéma mental du prospect dès les premières secondes pour éviter qu'il ne raccroche par réflexe."
      },
      {
        title: "Framework AIDA avancé (Neuro-Marketing)",
        prompt: "Rédige une publicité Facebook en utilisant le framework AIDA couplé aux biais cognitifs. Produit : [PRODUIT]. Utilise le biais de rareté pour l'Action, le biais d'autorité pour l'Intérêt, et l'aversion à la perte pour le Désir.",
        technique: "Aversion à la perte : Les humains sont 2 fois plus motivés par la peur de perdre quelque chose que par l'envie de gagner quelque chose."
      }
    ]
  },
  {
    id: "social",
    name: "Réseaux Sociaux",
    prompts: [
      {
        title: "Post LinkedIn Viral (Format Storytelling)",
        prompt: "Rédige un post LinkedIn viral basé sur une erreur que j'ai faite dans mon business [TON BUSINESS]. Commence par une phrase d'accroche très clivante. Fais des phrases courtes (1 idée par ligne). Termine par 3 leçons apprises et une question pour l'engagement."
      },
      {
        title: "Thread Twitter (X) Éducatif",
        prompt: "Écris un Thread Twitter de 10 tweets sur le sujet : [TON SUJET]. Le premier tweet doit être un 'Hook' ravageur qui donne envie de lire la suite. Utilise des emojis avec parcimonie. Le dernier tweet doit promouvoir ma newsletter [LIEN]."
      },
      {
        title: "Script Vidéo TikTok / YouTube Shorts",
        prompt: "Écris un script mot pour mot pour un TikTok de 45 secondes. Le sujet est [SUJET]. Divise le script en 2 colonnes : 'Visuel/Action' et 'Voix Off'. Utilise une accroche (Hook) dans les 3 premières secondes pour éviter que les gens scrollent."
      },
      {
        title: "Calendrier Éditorial 30 Jours",
        prompt: "Agis comme un Social Media Manager. Crée-moi un calendrier éditorial sur 30 jours pour Instagram et TikTok. Ma niche est [NICHE]. Propose-moi chaque jour une idée de post spécifique avec un format (Reel, Carrousel, Photo) et l'objectif (Vente, Valeur, Divertissement)."
      },
      {
        title: "Réponses aux Commentaires Haters",
        prompt: "Je reçois beaucoup de commentaires négatifs me disant que [LA CRITIQUE]. Rédige 5 réponses diplomatiques, professionnelles, mais piquantes pour recadrer ces commentaires sans paraître agressif ou sur la défensive."
      },
      {
        title: "Idées de Carrousels Instagram",
        prompt: "Génère 10 idées de Carrousels Instagram ultra-sauvegardables (high save-rate) dans la niche de [NICHE]. Pour chaque idée, donne-moi le titre de la couverture (Slide 1) et le plan des 5 slides suivantes."
      },
      {
        title: "Bio Instagram / Twitter Optimisée",
        prompt: "Propose-moi 5 versions différentes pour ma biographie Instagram/Twitter. Je suis un [TON MÉTIER] qui aide les [TA CIBLE] à [TON RÉSULTAT]. Je veux des bios qui optimisent la conversion avec un Call-to-Action clair vers mon lien."
      },
      {
        title: "Contenu pour Stories (Engagement)",
        prompt: "Donne-moi 15 idées de Stories interactives (avec Sondages, Questions, Quiz) pour engager mon audience aujourd'hui. Mon domaine d'expertise est [DOMAINE]."
      },
      {
        title: "Trouver des Influenceurs (Stratégie)",
        prompt: "Propose une stratégie étape par étape pour contacter des micro-influenceurs sur Instagram et TikTok pour promouvoir mon produit [PRODUIT]. Rédige aussi le template de DM ou d'email pour les approcher sans paraître désespéré."
      },
      {
        title: "Recyclage de Contenu (Content Repurposing)",
        prompt: "Voici le lien/texte d'une longue vidéo YouTube que j'ai faite : [TEXTE/IDÉE]. Transforme ce texte en : 1 Post LinkedIn, 1 Thread Twitter, 1 Script Tiktok et 1 Email pour ma newsletter."
      }
    ]
  },
  {
    id: "seo",
    name: "SEO & Rédaction Web",
    prompts: [
      {
        title: "Article de Blog Optimisé SEO",
        prompt: "Rédige un article de blog de 1000 mots sur la requête clé principale '[MOT CLÉ]'. Utilise des balises H2 et H3 pertinentes. Le ton doit être expert. Inclus une introduction captivante, une liste à puces, et une conclusion avec un appel à l'action."
      },
      {
        title: "Recherche de Mots-Clés de Longue Traîne",
        prompt: "Génère une liste de 30 mots-clés de longue traîne (low competition, high intent) autour de la thématique '[THÉMATIQUE]'. Regroupe-les par intention de recherche : Informationnel, Navigationnel, Commercial, Transactionnel."
      },
      {
        title: "Audit de Contenu Existant",
        prompt: "Voici un article de mon blog : [COLLE L'ARTICLE]. Analyse cet article d'un point de vue SEO et donne-moi 10 recommandations spécifiques pour améliorer son classement Google (sémantique, structure, densité de mots-clés)."
      },
      {
        title: "Générateur de Balises Title & Meta Description",
        prompt: "Pour ma page web qui parle de [SUJET], génère 10 propositions de balises Title (max 60 caractères) optimisées pour le CTR, et 5 Meta Descriptions (max 155 caractères) intégrant le mot clé '[MOT CLÉ]'."
      },
      {
        title: "Plan de Site (Siloing Sémantique)",
        prompt: "Je crée un site e-commerce dans la niche [NICHE]. Propose-moi une architecture de site en silo sémantique (Cocon Sémantique). Donne les catégories principales (Silo), les sous-catégories, et 5 idées d'articles de blog par catégorie."
      },
      {
        title: "Optimisation de Fiche Produit E-commerce",
        prompt: "Rédige une description de fiche produit SEO pour mon e-commerce. Produit : [PRODUIT]. Caractéristiques : [CARAC]. La description doit faire au moins 300 mots, répondre aux objections, et utiliser des mots de transition SEO."
      },
      {
        title: "Stratégie de Netlinking (Backlinks)",
        prompt: "Donne-moi 10 stratégies non-conventionnelles et réalisables pour obtenir des backlinks (liens entrants) de haute qualité pour mon blog sur [THÉMATIQUE]. Rédige l'email type (Outreach) à envoyer aux blogueurs."
      },
      {
        title: "Brief pour un Rédacteur Web",
        prompt: "Génère un brief de rédaction SEO extrêmement détaillé à donner à mon rédacteur freelance. L'article doit parler de [SUJET]. Le brief doit inclure : Mots-clés principaux/secondaires, structure H2/H3 exacte imposée, maillage interne exigé."
      },
      {
        title: "Foire Aux Questions (FAQ Schema.org)",
        prompt: "Génère une liste de 10 questions/réponses fréquemment posées sur Google (People Also Ask) concernant [SUJET]. Rédige des réponses concises de 40 mots maximum, idéales pour obtenir la position zéro (Featured Snippet)."
      },
      {
        title: "Optimisation d'Image (Alt Text)",
        prompt: "Pour les 5 images suivantes de mon article sur [SUJET] : 1. Une voiture, 2. Un ordinateur, etc... Génère des textes alternatifs (Alt Text) parfaits pour le SEO, ni trop courts, ni spammy."
      }
    ]
  },
  {
    id: "dev",
    name: "Développement & Code",
    prompts: [
      {
        title: "Explication de Code Complexe",
        prompt: "Agis comme un professeur d'informatique. Voici un bloc de code que je ne comprends pas : [CODE]. Explique-moi ligne par ligne ce que fait ce code, quel est son but, et la complexité temporelle (Big O)."
      },
      {
        title: "Générateur de Tests Unitaires (Jest/Mocha)",
        prompt: "Voici une fonction [LANGAGE] : [CODE FONCTION]. Écris une suite de tests unitaires complète pour cette fonction en couvrant les cas normaux, les cas limites (edge cases) et la gestion des erreurs."
      },
      {
        title: "Refactoring & Clean Code",
        prompt: "Refactorise ce code sale : [CODE]. Rends-le plus lisible, applique les principes SOLID, donne de meilleurs noms aux variables, et optimise ses performances. Explique ensuite ce que tu as changé et pourquoi."
      },
      {
        title: "Conversion de Langage",
        prompt: "Traduis ce script écrit en [LANGAGE SOURCE] vers le langage [LANGAGE CIBLE]. Assure-toi d'utiliser les bonnes pratiques idiomatiques du langage cible (ex: compréhension de liste en Python, méthodes d'array en JS) : [CODE]."
      },
      {
        title: "Écriture de Requêtes SQL Complexes",
        prompt: "J'ai deux tables : 'users' (id, nom, email) et 'orders' (id, user_id, amount, date). Écris une requête SQL optimisée qui retourne le nom et l'email des 5 utilisateurs ayant dépensé le plus d'argent au total ce mois-ci."
      },
      {
        title: "Générateur de Regex (Expressions Régulières)",
        prompt: "Écris une Expression Régulière (Regex) qui permet d'extraire [CE QUE TU VEUX EXTRAIRE] à partir d'un grand texte. Explique ensuite chaque symbole de ta regex pour que je la comprenne."
      },
      {
        title: "Génération de Fausse Data (Mock Data)",
        prompt: "Génère un tableau JSON contenant 10 objets factices représentant des [ENTITÉ, ex: Utilisateurs]. Chaque objet doit avoir les propriétés suivantes : id (uuid), nom, email, age, adresse complète, et un booléen 'isActive'."
      },
      {
        title: "Configuration Docker / Docker-compose",
        prompt: "Génère un fichier 'docker-compose.yml' complet pour une application web classique. J'ai besoin d'un conteneur Node.js (frontend), un conteneur Python/Django (backend) et une base de données PostgreSQL. Ajoute les variables d'environnement."
      },
      {
        title: "Recherche de Bug (Débugueur)",
        prompt: "Mon application plante. Voici mon code : [CODE]. Et voici l'erreur console exacte : [ERREUR]. Trouve d'où vient le bug, explique la cause de l'erreur, et fournis le code corrigé complet."
      },
      {
        title: "Documentation Automatique (JSDoc/Docstring)",
        prompt: "Ajoute de la documentation complète (style JSDoc ou Docstring) à ce fichier de code : [CODE]. Documente chaque fonction, ses paramètres, son type de retour et ajoute un exemple d'utilisation dans les commentaires."
      }
    ]
  },
  {
    id: "business",
    name: "Business & Startup",
    prompts: [
      {
        title: "Brainstorming d'Idées de Startup",
        prompt: "Agis comme le CEO de Y Combinator. Je m'intéresse au marché de [DOMAINE]. Donne-moi 10 idées de startups B2B SaaS non-conventionnelles dans ce secteur qui résolvent des problèmes douloureux et urgents."
      },
      {
        title: "Créer un Pitch Deck Parfait",
        prompt: "Structure-moi un Pitch Deck de 10 slides pour ma startup [NOM] qui fait [PROJET]. Détaille exactement ce que je dois écrire sur chaque slide (Problème, Solution, Marché, Business Model, Équipe...) pour convaincre des investisseurs."
      },
      {
        title: "Analyse SWOT Concurrentielle",
        prompt: "Réalise une analyse SWOT (Forces, Faiblesses, Opportunités, Menaces) extrêmement détaillée pour une entreprise qui se lance dans [DOMAINE], face à son concurrent principal [NOM CONCURRENT]."
      },
      {
        title: "Trouver son Product-Market Fit",
        prompt: "Je viens de lancer [PRODUIT] et je n'ai pas de ventes. Propose-moi un plan d'action sur 30 jours, étape par étape, pour pivoter, interroger mes utilisateurs, et trouver enfin mon Product-Market Fit."
      },
      {
        title: "Stratégie de Pricing (Prix)",
        prompt: "Je vends un logiciel SaaS de [DOMAINE]. Propose-moi 3 modèles de tarification (Pricing) différents (ex: Freemium, Usage-based, Flat-rate). Pour chacun, explique la psychologie derrière le prix et comment inciter à l'upsell."
      },
      {
        title: "Création de SOP (Procédures Standardisées)",
        prompt: "Rédige une SOP (Standard Operating Procedure) détaillée étape par étape pour déléguer la tâche suivante à un assistant virtuel : [TA TÂCHE]. Sois si clair qu'un enfant de 10 ans pourrait suivre la procédure sans erreur."
      },
      {
        title: "Négociation de Contrat/Salaire",
        prompt: "Je dois négocier avec [INTERLOCUTEUR] pour obtenir [CE QUE TU VEUX]. Agis comme un négociateur du FBI (Chris Voss). Donne-moi 5 phrases d'accroche ou techniques de négociation ('Mirroring', 'Labeling') à utiliser pour gagner."
      },
      {
        title: "Stratégie de Lancement (Go-to-Market)",
        prompt: "Détaille-moi une stratégie de Go-to-Market (GTM) sur 8 semaines pour le lancement de mon application mobile de [DOMAINE]. Inclus les canaux d'acquisition, les partenariats, et les hacks de croissance pour les 1000 premiers utilisateurs."
      },
      {
        title: "Trouver des Partenariats B2B",
        prompt: "Je vends [PRODUIT]. Fais la liste de 10 types d'entreprises non-concurrentes mais complémentaires avec qui je pourrais faire des partenariats B2B (Cross-selling). Rédige l'email d'approche pour leur proposer ce partenariat gagnant-gagnant."
      },
      {
        title: "Simulation d'Entretien Investisseur",
        prompt: "Agis comme un investisseur en capital-risque (VC) agressif. Pose-moi la question la plus difficile et piège sur mon business de [DOMAINE]. Attends ma réponse, puis critique-la sans pitié pour m'entraîner."
      }
    ]
  },
  {
    id: "productivity",
    name: "Productivité & Organisation",
    prompts: [
      {
        title: "Planning de la Semaine Parfait",
        prompt: "Agis comme mon coach de productivité. Je dois accomplir ces 5 gros objectifs cette semaine : [OBJECTIFS]. J'ai 4 heures de travail profond par jour. Crée-moi un emploi du temps time-blocké du lundi au vendredi."
      },
      {
        title: "La Matrice d'Eisenhower",
        prompt: "Voici la liste de tout ce que j'ai à faire aujourd'hui : [LISTE DE TÂCHES]. Classe ces tâches dans la matrice d'Eisenhower (Urgent/Important, Non Urgent/Important, Urgent/Non Important, Non Urgent/Non Important)."
      },
      {
        title: "Vaincre la Procrastination",
        prompt: "Je repousse constamment la tâche suivante : [TÂCHE]. Pose-moi des questions psychologiques pour comprendre le blocage racine, et propose-moi un plan d'action absurde de 'Micro-étapes' pour démarrer dans les 2 prochaines minutes."
      },
      {
        title: "Organisation du 'Second Brain'",
        prompt: "Je veux utiliser la méthode PARA de Tiago Forte sur mon Notion. Aide-moi à classer ces 20 éléments de ma vie (projets en cours, loisirs, notes de livres, papiers administratifs) dans les dossiers Projects, Areas, Resources, et Archives."
      },
      {
        title: "Résumé de Livre Non-Fiction",
        prompt: "Résume-moi le livre '[TITRE DU LIVRE]'. Ne me donne pas juste un résumé plat. Donne-moi les 3 concepts fondamentaux, et explique-moi comment appliquer chaque concept concrètement dans mon travail de [TON MÉTIER]."
      },
      {
        title: "Générateur d'Objectifs SMART",
        prompt: "J'ai un objectif très flou : 'Je veux gagner plus d'argent avec mon blog'. Transforme cet objectif en un objectif S.M.A.R.T (Spécifique, Mesurable, Atteignable, Réaliste, Temporel) avec des KPI précis à suivre."
      },
      {
        title: "Routine Matinale de Millionnaire",
        prompt: "Crée-moi une routine matinale (Morning Routine) réaliste de 60 minutes basée sur les neurosciences (Huberman Lab) pour maximiser ma concentration avant 9h du matin. N'inclus pas de choses impossibles, je dois pouvoir la tenir."
      },
      {
        title: "Optimisation de l'Espace de Travail",
        prompt: "Je travaille de chez moi (Télétravail). Donne-moi 10 règles strictes d'ergonomie et de psychologie environnementale pour optimiser mon bureau afin d'atteindre un état de 'Flow' plus rapidement chaque jour."
      },
      {
        title: "Bilan Hebdomadaire (Weekly Review)",
        prompt: "Agis comme un manager bienveillant. Je vais te donner ce que j'ai fait cette semaine. Fais un bilan, pointe les moments où j'ai perdu du temps, et aide-moi à définir mes 3 priorités absolues (Big 3) pour lundi."
      },
      {
        title: "Délégation Extrême",
        prompt: "Voici tout ce que je fais dans une journée de travail : [TA JOURNÉE]. Identifie les tâches à faible valeur ajoutée (moins de4 000 DZD/heure) que je devrais déléguer, et dis-moi exactement sur quelles plateformes (Fiverr, Upwork) engager quelqu'un."
      }
    ]
  },
  {
    id: "midjourney",
    name: "Design & Midjourney",
    prompts: [
      {
        title: "Portrait Ultra-Réaliste (Cinematic)",
        prompt: "Cinematic portrait photography of a [DESCRIPTION DU SUJET, ex: cyberpunk hacker], neon lighting, 85mm lens, depth of field, dramatic shadows, highly detailed, photorealistic, 8k resolution, shot on Arri Alexa --ar 16: 9 --style raw --v 6.0"
      },
      {
        title: "Création de Logo Minimaliste",
        prompt: "Minimalist vector logo of a [OBJET/ANIMAL, ex: fox], flat design, clean lines, geometric shapes, white background, corporate style, dribbble, behance, --no shading, realistic details --v 6.0"
      },
      {
        title: "Design d'Interface Web (UI/UX)",
        prompt: "Beautiful UI UX design of a modern dashboard web application for [SUJET, ex: crypto trading], dark mode, glassmorphism, clean layout, dashboard layout, vibrant neon accents, highly detailed, dribbble top shot --ar 16: 9"
      },
      {
        title: "Architecture Intérieure",
        prompt: "Interior design photography of a luxury modern living room, wabi-sabi style, large windows overlooking a forest, warm sunlight, beige and wood tones, high end furniture, architectural digest, photorealistic --ar 16: 9 --v 6.0"
      },
      {
        title: "Personnage 3D (Style Pixar)",
        prompt: "3D render of a cute little [PERSONNAGE/ANIMAL], Pixar style, Disney animation style, big expressive eyes, octane render, unreal engine 5, soft lighting, vibrant colors, detailed textures, 8k --ar 4: 5 --v 6.0"
      },
      {
        title: "Paysage Fantasy & Épique",
        prompt: "Epic fantasy landscape, giant ancient ruins in a lush jungle, glowing magical crystals, cinematic lighting, concept art, trending on artstation, masterpiece, highly detailed, greg rutkowski style --ar 21: 9"
      },
      {
        title: "Génération de Patterns / Textures",
        prompt: "Seamless pattern of [SUJET, ex: tropical leaves and flowers], flat design, pastel colors, wallpaper design, vector art, symmetric, elegant --tile --v 6.0"
      },
      {
        title: "Style Illustration Vintage",
        prompt: "Vintage 1950s comic book illustration of [SUJET], pop art style, halftone dots, vibrant retro colors, bold black outlines, retro aesthetic --ar 3: 4"
      },
      {
        title: "Photographie Culinaire (Food)",
        prompt: "Professional food photography of a delicious [PLAT, ex: gourmet burger with melted cheese], dark moody background, studio lighting, smoke, macro photography, extremely detailed, mouthwatering, 8k --ar 4: 5"
      },
      {
        title: "Isométrique 3D",
        prompt: "Isometric 3d rendering of a miniature [LIEU, ex: cyberpunk city block], tilt shift photography, highly detailed, clay render style, vibrant lighting, octane render, plain background --v 6.0"
      }
    ]
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Dropshipping",
    prompts: [
      {
        title: "Recherche de Produit Winner",
        prompt: "Agis comme un expert en E-commerce. Donne-moi 10 idées de produits 'Winner' pour le dropshipping dans la niche [NICHE]. Chaque produit doit avoir un 'Effet Waouh', résoudre un problème profond, et avoir une bonne marge."
      },
      {
        title: "Description Produit (Shopify)",
        prompt: "Rédige une description produit Shopify qui convertit pour [PRODUIT]. Utilise la structure : 1. Accroche émotionnelle. 2. Présentation des 3 bénéfices clés avec bullet points. 3. Caractéristiques techniques. 4. Garantie de remboursement."
      },
      {
        title: "Script TikTok / UGC Dropshipping",
        prompt: "Génère 3 scripts pour des vidéos TikTok UGC (User Generated Content) pour vendre [MON PRODUIT]. Chaque script doit faire moins de 15 secondes. Inclus le mouvement visuel exact que l'acteur doit faire (Ex: 'Tient le produit devant la caméra choque')."
      },
      {
        title: "Campagne de Retargeting (Facebook)",
        prompt: "Crée 3 angles publicitaires (copies) pour une campagne Facebook de Retargeting ciblant des gens qui ont ajouté [PRODUIT] au panier mais n'ont pas acheté. Joue sur l'urgence, la raréfaction et la preuve sociale (avis)."
      },
      {
        title: "Email de Panier Abandonné",
        prompt: "Rédige un email de relance de panier abandonné. L'objet de l'email doit être très curieux. Le corps de l'email doit rappeler le produit, offrir un code promo exclusif de 10% expirant dans 24h, et rassurer sur la livraison."
      },
      {
        title: "Générateur d'Avis Clients (Mockups)",
        prompt: "Génère 15 faux avis clients très réalistes (pas trop parfaits, avec quelques petites remarques d'amélioration) pour mon produit [PRODUIT]. Alterne les avis d'hommes, de femmes, et les longueurs des textes."
      },
      {
        title: "Stratégie de Upsell / Cross-sell",
        prompt: "Mon produit principal est [PRODUIT]. Propose-moi 5 idées de produits complémentaires (Cross-sell) ou de montées en gamme (Upsell) que je pourrais proposer juste après le paiement (Post-Purchase Upsell)."
      },
      {
        title: "Référencement Fiche Produit (SEO)",
        prompt: "Optimise la fiche de mon produit [PRODUIT] pour Google. Donne-moi le titre H1 optimisé, la meta description, 5 balises H2, et une liste de mots-clés de longue traîne à inclure naturellement dans la description."
      },
      {
        title: "Créer une Offre Bundle (Pack)",
        prompt: "Je vends [PRODUIT]. Aide-moi à créer une offre Bundle (Pack) irrésistible. Trouve un nom accrocheur pour le pack, calcule le pourcentage de réduction perçu, et explique pourquoi le client ferait une erreur en achetant à l'unité."
      },
      {
        title: "Réponse au Service Client",
        prompt: "Un client est très en colère car son colis de [PRODUIT] a 2 semaines de retard. Rédige un message de service client pour calmer la situation, s'excuser professionnellement, et lui proposer une compensation sans rembourser tout de suite."
      }
    ]
  },
  {
    id: "youtube",
    name: "YouTube & Vidéo",
    prompts: [
      {
        title: "Générateur d'Idées de Vidéos",
        prompt: "Agis comme un stratège YouTube. Ma chaîne parle de [THÉMATIQUE]. Donne-moi 20 idées de vidéos avec un potentiel viral absolu. Combine 2 niches opposées ou utilise le format 'Je teste X pendant Y jours' pour attirer la curiosité."
      },
      {
        title: "Générateur de Titres Clickbait (Bons)",
        prompt: "Je fais une vidéo sur [SUJET]. Donne-moi 15 titres YouTube hyper optimisés pour le CTR (Taux de Clic). Les titres doivent créer un 'Curiosity Gap' (un mystère à résoudre) et faire moins de 60 caractères."
      },
      {
        title: "Script d'Introduction Parfait",
        prompt: "L'introduction (les 30 premières secondes) est vitale. Rédige l'intro mot pour mot de ma vidéo sur [SUJET]. Commence par une phrase choc ou une question fermée, prouve que tu es légitime, et annonce la promesse de la vidéo très clairement."
      },
      {
        title: "Idées de Miniatures (Thumbnails)",
        prompt: "Pour ma vidéo intitulée '[TITRE DE LA VIDÉO]', donne-moi 5 concepts visuels très détaillés pour la miniature YouTube. Précise le texte à écrire (max 3 mots), l'expression de mon visage, le décor en arrière-plan et l'objet au premier plan."
      },
      {
        title: "Plan de Vidéo (Structure Retention)",
        prompt: "Structure cette vidéo sur [SUJET] pour maximiser la Rétention Audience (Watch Time). Divise-la en chapitres clairs. Ajoute des 'Open Loops' (teasing) à la fin de chaque chapitre pour forcer le spectateur à regarder le suivant."
      },
      {
        title: "Appel à l'Action (Abonnement)",
        prompt: "Rédige 3 manières différentes et non-gênantes de demander à mon audience de s'abonner et de liker au milieu de ma vidéo sur [SUJET]. Ça doit être naturel, court et lié au sujet de la vidéo."
      },
      {
        title: "Description YouTube & SEO",
        prompt: "Rédige la description de ma vidéo YouTube sur [SUJET]. Optimise les 2 premières lignes pour la recherche Google. Inclus un sommaire avec des Timestamps, mes liens de réseaux sociaux, et 10 hashtags pertinents."
      },
      {
        title: "Sponsor Pitch (Trouver un Sponsor)",
        prompt: "Rédige un email professionnel pour démarcher [MARQUE] et leur proposer de sponsoriser ma prochaine vidéo YouTube qui fera environ [NOMBRE] de vues. Le pitch doit prouver que mon audience correspond parfaitement à leur cible."
      },
      {
        title: "Intégration du Sponsor",
        prompt: "Je suis sponsorisé par [MARQUE] pour ma vidéo sur [SUJET]. Rédige l'intégration (Ad Read) de 60 secondes. Fais une transition fluide et humoristique depuis mon sujet, présente le problème, et la solution du sponsor."
      },
      {
        title: "Répondre aux Commentaires",
        prompt: "Génère 10 réponses drôles, courtes et engageantes (avec emojis) que je pourrais copier-coller pour répondre aux commentaires génériques ('Super vidéo !', 'Merci pour l'astuce !') sous ma nouvelle vidéo."
      }
    ]
  },
  {
    id: "students",
    name: "Étudiants & Apprentissage",
    prompts: [
      {
        title: "Technique Feynman (Simplification)",
        prompt: "Explique-moi le concept complexe de [CONCEPT] en utilisant la technique de Feynman. C'est-à-dire : utilise des mots très simples, des analogies de la vie quotidienne, comme si tu expliquais ça à un enfant de 12 ans."
      },
      {
        title: "Générateur de Flashcards (Anki)",
        prompt: "Voici mon cours sur [SUJET] : [TEXTE DU COURS]. Génère une liste de 20 questions/réponses très courtes basées sur ce texte, formatées exactement pour être importées dans le logiciel Anki ou Quizlet."
      },
      {
        title: "Plan de Révision Intensif",
        prompt: "J'ai un examen très important sur le sujet [MATIÈRE] dans [NOMBRE] de jours. J'ai [HEURES] par jour pour réviser. Crée un planning de révision intensif basé sur le 'Spaced Repetition' et l'Active Recall."
      },
      {
        title: "Correcteur d'Essai ou de Dissertation",
        prompt: "Voici la dissertation que j'ai écrite : [TEXTE]. Note-la sévèrement sur 20. Corrige mes fautes de grammaire, souligne les failles logiques dans mon argumentation, et propose une meilleure introduction."
      },
      {
        title: "Créer un Plan de Mémoire/Thèse",
        prompt: "Je dois rédiger un mémoire de 50 pages sur le sujet : [SUJET]. Propose-moi un plan détaillé avec Introduction, 3 grandes Parties (I, II, III), des sous-parties (A, B) et une conclusion. Suggère 5 auteurs ou livres à citer."
      },
      {
        title: "Apprentissage d'une Langue",
        prompt: "Agis comme un natif [LANGUE]. Lance une conversation avec moi pour que je pratique. Corrige systématiquement mes erreurs après chacune de mes réponses, et explique-moi la règle de grammaire associée de façon simple."
      },
      {
        title: "Mnémoniques et Moyens Mémotechniques",
        prompt: "Je dois mémoriser par cœur la liste suivante : [LISTE DE CHOSES]. Crée-moi une phrase mnémotechnique amusante ou une histoire mentale bizarre (Palais Mental) pour m'aider à retenir cette liste parfaitement dans l'ordre."
      },
      {
        title: "Traduction Académique",
        prompt: "Traduis ce texte [LANGUE 1] vers le [LANGUE 2] de manière académique et formelle, parfaite pour un article de recherche universitaire. Ne fais pas de traduction littérale, utilise le jargon technique approprié : [TEXTE]"
      },
      {
        title: "Générateur d'Examens Blancs",
        prompt: "Agis comme un professeur d'université. Génère un examen blanc de niveau [NIVEAU/ANNÉE] sur la matière [MATIÈRE]. L'examen doit contenir 10 QCM avec 4 choix, et 2 questions ouvertes de réflexion. Donne les réponses corrigées à la fin."
      },
      {
        title: "Trouver des Stages/Alternances",
        prompt: "Rédige une lettre de motivation percutante et moderne pour décrocher un stage de [MÉTIER] chez [NOM DE L'ENTREPRISE]. Ne fais pas une lettre ennuyeuse 'Madame, Monsieur'. Fais une lettre qui prouve ma passion et ce que je peux LEUR apporter."
      }
    ]
  },
  {
    id: "ia-optimisation",
    name: "Optimisation IA & Prompts Avancés",
    prompts: [
      {
        title: "Générateur de Super-Prompts (Meta-Prompting)",
        prompt: "Tu es un ingénieur en IA expert. Je veux que tu m'aides à créer le meilleur prompt possible pour la tâche suivante : [TÂCHE]. Pose-moi 5 questions pour affiner le contexte, puis propose-moi 3 itérations du prompt de plus en plus complexes.",
        technique: "Meta-Prompting : Utiliser l'IA pour qu'elle s'auto-améliore et génère ses propres instructions optimales."
      },
      {
        title: "Chain of Thought (Raisonnement Étape par Étape)",
        prompt: "Je veux que tu résolves ce problème logique complexe : [PROBLÈME]. Avant de me donner la réponse finale, explique ton raisonnement étape par étape. Si tu rencontres une contradiction, signale-la avant de continuer.",
        technique: "Chain of Thought (CoT) : Forcer l'IA à verbaliser son raisonnement intermédiaire réduit drastiquement les hallucinations et les erreurs de logique."
      },
      {
        title: "Few-Shot Prompting (Apprentissage par l'Exemple)",
        prompt: "Classifie le ton de la phrase suivante. Voici des exemples :\n- 'C'est un désastre total.' -> Négatif\n- 'Je suis aux anges !' -> Positif\n- 'La météo est grise aujourd'hui.' -> Neutre\nMaintenant, classifie cette phrase : '[TA PHRASE]'.",
        technique: "Few-Shot : Donner 2 à 5 exemples clairs du format de sortie attendu pour forcer l'IA à adopter exactement ce moule."
      },
      {
        title: "Act As (Jeu de Rôle avec Contraintes)",
        prompt: "Agis comme un avocat fiscaliste avec 20 ans d'expérience. Tu ne dois utiliser que des termes légaux précis. Réponds à la question suivante : [QUESTION]. Si la demande est illégale, refuse formellement en citant un article de loi fictif.",
        technique: "Persona & Constraints : Restreindre l'espace de probabilité de l'IA pour éviter les réponses génériques et fades."
      },
      {
        title: "Éviter la Consommation Inutile de Tokens",
        prompt: "Résume ce texte de 5000 mots : [TEXTE]. Règle stricte : Ta réponse finale ne doit pas dépasser 50 mots au total. Ne génère aucune phrase de politesse (pas de 'Voici le résumé...'). Donne uniquement l'information.",
        technique: "Token Management : En interdisant les phrases de remplissage et en fixant des limites strictes, on économise massivement les crédits API sur de gros volumes."
      }
    ]
  }
];
