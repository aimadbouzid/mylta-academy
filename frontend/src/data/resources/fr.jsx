import React from 'react'
import { ExternalLink, Star, Mic, Video, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp, TrendingUp, Smartphone, Music, ShoppingCart, PenTool, Monitor, Layout, Headphones, GraduationCap, Palette, Share2, Download, Rocket, Brain, Zap, ShieldCheck, CheckCircle2, ClipboardCopy, TerminalSquare, RefreshCw, Beaker, Wand2, Youtube, PlayCircle, Search, Mail, ArrowRight, Lightbulb, Target, AlertCircle, Activity } from 'lucide-react'

export const resourceCategories = [
  {
    id: "web-dev",
    shortTitle: "Développement Web",
    title: "Développement Web (IA & Code)",
    description: "Les meilleurs outils IA pour écrire du code plus vite et concevoir des applications web complexes.",
    icon: <Monitor size={20} />,
    color: "text-blue-500",
    tools: [
      { name: "ChatGPT", url: "https:chat.openai.com", desc: "Le classique absolu pour générer du code, débugger et expliquer des algorithmes.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Cursor", url: "https:cursor.sh", desc: "L'éditeur de code (basé sur VS Code) dopé à l'IA, de loin le plus puissant du marché.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "v0 par Vercel", url: "https:v0.dev", desc: "Générez des interfaces React/Tailwind magnifiques en tapant une simple description.", badges: ["Crédits Gratuits", "Sans Filigrane"] },
      { name: "GitHub Copilot", url: "https:github.com/features/copilot", desc: "L'assistant IA de GitHub intégré directement dans votre éditeur.", badges: ["Essai Gratuit", "Payant"] },
      { name: "Codeium", url: "https:codeium.com", desc: "Une alternative puissante et totalement gratuite à GitHub Copilot pour les freelances.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Blackbox AI", url: "https:www.blackbox.ai", desc: "Une intelligence artificielle pensée spécifiquement pour les développeurs web.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Replit", url: "https:replit.com", desc: "Codez, compilez et hébergez vos projets directement dans le navigateur avec Replit AI.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Supabase", url: "https:supabase.com", desc: "L'alternative Open Source à Firebase pour gérer vos bases de données très facilement.", badges: ["Freemium", "Open Source"] },
      { name: "Mintlify", url: "https:mintlify.com", desc: "Génération automatique et instantanée de documentation pour votre base de code.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Tabnine", url: "https:www.tabnine.com", desc: "Autocomplétion de code IA ultra-rapide et respectueuse de la vie privée.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Phind", url: "https://www.phind.com", desc: "Moteur de recherche IA ultra-rapide conçu spécialement pour les développeurs.", badges: ["100% Gratuit", "IA & Code"] },
      { name: "Render", url: "https://render.com", desc: "Plateforme cloud moderne pour héberger vos applications, bases de données et APIs gratuitement.", badges: ["Freemium", "Hébergement"] },
      { name: "Daily.dev", url: "https://daily.dev", desc: "Extension de navigateur indispensable pour obtenir les meilleures actualités tech et dev au monde.", badges: ["100% Gratuit", "Actualités"] },
      { name: "Locofy.ai", url: "https://www.locofy.ai", desc: "Transformez vos designs Figma en code React, Vue ou HTML/CSS de haute qualité.", badges: ["Freemium", "Figma to Code"] },
      { name: "Railway", url: "https://railway.app", desc: "Déployez vos applications et bases de données en un clic avec une expérience développeur inégalée.", badges: ["Freemium", "Hébergement"] },
      { name: "Clerk", url: "https://clerk.com", desc: "La solution d'authentification et de gestion des utilisateurs la plus simple pour vos projets web.", badges: ["Freemium", "Sécurité"] },
      { name: "Resend", url: "https://resend.com", desc: "API de messagerie moderne et élégante pour envoyer des e-mails transactionnels facilement.", badges: ["Freemium", "Email API"] },
      { name: "Neon", url: "https://neon.tech", desc: "Base de données PostgreSQL serverless avec branchement instantané et stockage séparé.", badges: ["Freemium", "Base SQL"] },
      { name: "Appwrite", url: "https://appwrite.io", desc: "Plateforme backend open-source complète pour créer des applications web et mobiles rapidement.", badges: ["Freemium", "Backend"] },
      { name: "PlanetScale", url: "https://planetscale.com", desc: "Base de données MySQL serverless compatible avec les workflows Git de production.", badges: ["Essai Gratuit", "Base SQL"] },
      { name: "StackBlitz", url: "https://stackblitz.com", desc: "Environnements de développement web en ligne instantanés exécutés dans votre navigateur.", badges: ["Freemium", "IDE Web"] },
      { name: "Astro", url: "https://astro.build", desc: "Le framework web moderne pour créer des sites axés sur le contenu ultra-rapides.", badges: ["100% Gratuit", "Framework"] },
      { name: "SvelteKit", url: "https://kit.svelte.dev", desc: "Framework rapide et minimaliste pour concevoir des applications web interactives légères.", badges: ["100% Gratuit", "Framework"] },
      { name: "Kinsta", url: "https://kinsta.com", desc: "Hébergement WordPress et applications infogéré haut de gamme propulsé par Google Cloud.", badges: ["Payant", "Hébergement"] }
]
  },
  {
    id: "no-code",
    shortTitle: "No-Code & Création",
    title: "No-Code & Création de Sites",
    description: "Créez des sites web et des applications complètes sans écrire une seule ligne de code.",
    icon: <Layout size={20} />,
    color: "text-indigo-500",
    tools: [
      { name: "Webflow", url: "https:webflow.com", desc: "L'outil no-code ultime pour créer des sites web professionnels, animés et ultra-rapides.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Framer", url: "https:www.framer.com", desc: "Générez des sites complets avec une simple phrase IA, parfait pour les portfolios.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "WordPress.org", url: "https:wordpress.org", desc: "Le CMS qui propulse 40% du web mondial. Gratuit, mais nécessite un hébergement.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Bubble", url: "https:bubble.io", desc: "Le logiciel no-code le plus puissant pour créer des applications web complexes.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Make", url: "https:www.make.com", desc: "L'alternative plus visuelle et moins chère à Zapier pour automatiser des processus.", badges: ["Freemium", "Limité"] },
      { name: "Zapier", url: "https:zapier.com", desc: "Le leader pour connecter vos applications entre elles sans savoir coder.", badges: ["Freemium", "Limité"] },
      { name: "Softr", url: "https:www.softr.io", desc: "Créez des portails clients ou des sites web complets à partir d'une base Airtable.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Airtable", url: "https:airtable.com", desc: "Une base de données hybride entre Excel et une DB puissante, parfaite pour le No-Code.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Wix", url: "https:fr.wix.com", desc: "L'outil de création de sites web le plus simple pour les débutants absolus.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Notion (Sites)", url: "https:www.notion.so", desc: "Transformez n'importe quelle page Notion en site web public en un clic.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Toddle", url: "https://toddle.dev", desc: "Le constructeur d'applications web visuel le plus puissant pour remplacer le code frontend.", badges: ["Freemium", "Frontend"] },
      { name: "N8N", url: "https://n8n.io", desc: "Le constructeur d'automatisation de flux open source à héberger soi-même pour connecter vos apps.", badges: ["Freemium", "Automatisation"] },
      { name: "Formspree", url: "https://formspree.io", desc: "Envoyez les formulaires de vos sites statiques directement par e-mail sans backend.", badges: ["Freemium", "Formulaires"] },
      { name: "Baserow", url: "https://baserow.io", desc: "Alternative open-source moderne et ultra-rapide à Airtable pour vos bases de données.", badges: ["Freemium", "Bases de données"] },
      { name: "Rowy", url: "https://www.rowy.io", desc: "Gerez votre base de données Firestore / Firebase avec une interface tableur collaborative.", badges: ["Freemium", "Base de données"] },
      { name: "Stacker", url: "https://www.stackerhq.com", desc: "Créez des portails clients et applications internes à partir de Airtable ou Google Sheets.", badges: ["Essai Gratuit", "Portails"] },
      { name: "Draftbit", url: "https://draftbit.com", desc: "Concevez et lancez des applications mobiles natives visuellement avec export de code propre.", badges: ["Essai Gratuit", "Mobile Apps"] },
      { name: "Squarespace", url: "https://www.squarespace.com", desc: "Le constructeur de sites web élégant par excellence pour portefeuilles et boutiques.", badges: ["Essai Gratuit", "Site Builder"] },
      { name: "Weebly", url: "https://www.weebly.com", desc: "Solution de création de site internet par glisser-déposer facile et rapide de Square.", badges: ["Freemium", "Site Builder"] },
      { name: "Landbot", url: "https://landbot.io", desc: "Créez des formulaires de chat conversationnels riches pour capturer des leads sans coder.", badges: ["Freemium", "Chatbots"] },
      { name: "Directus", url: "https://directus.io", desc: "CMS headless instantané et wrapper d'API de base de données SQL existante.", badges: ["Freemium", "CMS & API"] },
      { name: "Strapi", url: "https://strapi.io", desc: "Le CMS headless open-source en JavaScript (Node.js) le plus populaire et personnalisable.", badges: ["Freemium", "CMS"] },
      { name: "Linktree", url: "https://linktr.ee", desc: "Optimisez vos liens de réseaux sociaux dans une page de profil bio centralisée.", badges: ["Freemium", "Bio Links"] }
]
  },
  {
    id: "ecommerce",
    shortTitle: "E-Commerce",
    title: "E-Commerce & Dropshipping",
    description: "Les meilleures plateformes pour lancer votre boutique en ligne et gérer vos ventes.",
    icon: <ShoppingCart size={20} />,
    color: "text-yellow-500",
    tools: [
      { name: "Shopify", url: "https:www.shopify.com", desc: "Le géant du e-commerce mondial. Facile à utiliser pour lancer une boutique rapidement.", badges: ["Essai Gratuit", "Payant"] },
      { name: "WooCommerce", url: "https:woocommerce.com", desc: "Le plugin e-commerce de WordPress. Puissant mais technique.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Stripe", url: "https:stripe.com", desc: "L'infrastructure de paiement numéro 1 au monde pour accepter la carte bancaire.", badges: ["100% Gratuit", "Commissions"] },
      { name: "PayPal", url: "https:www.paypal.com", desc: "Indispensable pour offrir une alternative de paiement sécurisée à vos clients.", badges: ["100% Gratuit", "Commissions"] },
      { name: "Minea", url: "https:minea.com", desc: "Le meilleur outil de recherche de produits gagnants pour le dropshipping (Spy Ads).", badges: ["Essai Gratuit", "Payant"] },
      { name: "CJ Dropshipping", url: "https:cjdropshipping.com", desc: "Fournisseur rapide et fiable, excellente alternative à AliExpress.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Zendrop", url: "https:zendrop.com", desc: "Application dropshipping automatisée, très bons délais vers les US.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "AutoDS", url: "https:autods.com", desc: "Automatisez votre boutique : import de produits, commandes, suivi.", badges: ["Essai Gratuit", "Payant"] },
      { name: "Printify", url: "https:printify.com", desc: "Print On Demand (POD). Vendez vos t-shirts sans stock.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Printful", url: "https:www.printful.com", desc: "L'alternative Premium à Printify, avec une qualité supérieure.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Lemon Squeezy", url: "https://www.lemonsqueezy.com", desc: "Plateforme de paiement et de facturation automatique avec gestion de la TVA internationale pour produits digitaux.", badges: ["100% Gratuit", "Commissions"] },
      { name: "Spocket", url: "https://www.spocket.co", desc: "Fournisseur dropshipping de confiance avec des produits expédiés rapidement depuis les USA et l'Europe.", badges: ["Essai Gratuit", "Fournisseur"] },
      { name: "Klaviyo", url: "https://www.klaviyo.com", desc: "La plateforme de marketing par email et SMS de référence pour augmenter les ventes e-commerce.", badges: ["Freemium", "Email Marketing"] },
      { name: "Paddle", url: "https://paddle.com", desc: "Le Merchant of Record tout-en-un pour vendre vos SaaS et abonnements logiciels mondialement.", badges: ["100% Gratuit", "Commissions"] },
      { name: "BigCommerce", url: "https://www.bigcommerce.com", desc: "Solution e-commerce SaaS robuste pour les entreprises à forte croissance et les grands comptes.", badges: ["Essai Gratuit", "E-commerce"] },
      { name: "PrestaShop", url: "https://www.prestashop.com", desc: "Solution de commerce open-source hautement personnalisable et très populaire en Europe.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Alibaba", url: "https://www.alibaba.com", desc: "La plus grande plateforme B2B mondiale pour s'approvisionner en gros directement auprès des usines.", badges: ["100% Gratuit", "Sourcing"] },
      { name: "Magento / Adobe Commerce", url: "https://business.adobe.com/products/magento/magento-commerce.html", desc: "La plateforme e-commerce d'Adobe pour les grandes marques nécessitant une flexibilité totale.", badges: ["Gratuit/Payant", "Entreprise"] },
      { name: "CartLoop", url: "https://www.cartloop.io", desc: "SMS marketing conversationnel pour récupérer les paniers abandonnés avec des humains en direct.", badges: ["Essai Gratuit", "SMS Marketing"] },
      { name: "Loop Returns", url: "https://www.loopreturns.com", desc: "Automatisez vos retours e-commerce et transformez-les en échanges et fidélisation client.", badges: ["Payant", "Retours"] },
      { name: "Chargebee", url: "https://www.chargebee.com", desc: "Gestion des abonnements et de la facturation récurrente pour les modèles SaaS et e-commerce.", badges: ["Essai Gratuit", "Facturation"] },
      { name: "Shogun", url: "https://getshogun.com", desc: "Le constructeur de pages visuel par glisser-déposer le plus utilisé pour Shopify et BigCommerce.", badges: ["Essai Gratuit", "Page Builder"] },
      { name: "Gorgias", url: "https://www.gorgias.com", desc: "Le support client (helpdesk) conçu spécifiquement pour les boutiques e-commerce.", badges: ["Essai Gratuit", "Support Client"] },
      { name: "AliExpress", url: "https://www.aliexpress.com", desc: "La plateforme incontournable pour débuter en dropshipping en important des produits pas chers.", badges: ["100% Gratuit", "Sourcing"] }
]
  },
  {
    id: "marketing",
    shortTitle: "Marketing & SEO",
    title: "Marketing Digital & SEO",
    description: "Tout ce dont vous avez besoin pour analyser, référencer et propulser vos ventes.",
    icon: <TrendingUp size={20} />,
    color: "text-emerald-500",
    tools: [
      { name: "Google Analytics 4", url: "https:analytics.google.com", desc: "L'outil gratuit de Google pour analyser tout le trafic de votre site web en détail.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Google Search Console", url: "https:search.google.com", desc: "Indispensable pour suivre votre positionnement naturel (SEO) sur Google.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Ubersuggest", url: "https:neilpatel.com/ubersuggest", desc: "Trouvez les meilleurs mots-clés et analysez vos concurrents en quelques clics.", badges: ["Freemium", "Limité"] },
      { name: "AnswerThePublic", url: "https:answerthepublic.com", desc: "Découvrez exactement quelles questions les gens se posent sur Google.", badges: ["Freemium", "Limité"] },
      { name: "Systeme.io", url: "https:systeme.io", desc: "La meilleure alternative française pour créer des tunnels de vente complets gratuitement.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Brevo", url: "https:www.brevo.com", desc: "Excellente solution d'email marketing (gratuit jusqu'à 300 emails/jour).", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Mailchimp", url: "https:mailchimp.com", desc: "L'outil classique d'emailing (freemium jusqu'à 500 contacts).", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Meta Business Suite", url: "https:business.facebook.com", desc: "Le tableau de bord officiel pour gérer et analyser vos publicités Meta.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Hotjar", url: "https:www.hotjar.com", desc: "Enregistrez l'écran de vos visiteurs pour voir où ils cliquent (heatmaps).", badges: ["Freemium", "Limité"] },
      { name: "HubSpot CRM", url: "https:www.hubspot.fr", desc: "Un CRM complet 100% gratuit pour gérer tous vos clients et prospects de façon pro.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Plausible Analytics", url: "https://plausible.io", desc: "Alternative ultra-légère et respectueuse de la vie privée à Google Analytics, sans cookie.", badges: ["Essai Gratuit", "Analytique"] },
      { name: "SpyFu", url: "https://www.spyfu.com", desc: "Outil d'espionnage de mots-clés et campagnes AdWords de vos concurrents directs.", badges: ["Freemium", "SEO"] },
      { name: "Hunter.io", url: "https://hunter.io", desc: "Trouvez les adresses e-mail professionnelles de n'importe quelle entreprise en quelques secondes.", badges: ["Freemium", "Prospection"] },
      { name: "BuzzSumo", url: "https://buzzsumo.com", desc: "Analysez quels contenus fonctionnent le mieux pour n'importe quel sujet ou concurrent.", badges: ["Essai Gratuit", "Contenu"] },
      { name: "Lately AI", url: "https://www.lately.ai", desc: "L'IA qui réorganise vos articles ou vidéos longs en dizaines de publications sociales virales.", badges: ["Essai Gratuit", "Social AI"] },
      { name: "Crazy Egg", url: "https://www.crazyegg.com", desc: "Cartographie thermique de votre site pour voir exactement où vos visiteurs cliquent et défilent.", badges: ["Essai Gratuit", "Heatmaps"] },
      { name: "Instapage", url: "https://instapage.com", desc: "La plateforme de landing pages de référence pour optimiser vos campagnes publicitaires payantes.", badges: ["Essai Gratuit", "Landing Pages"] },
      { name: "Unbounce", url: "https://unbounce.com", desc: "Créez des pages de destination à conversion élevée avec des fonctionnalités d'IA intelligentes.", badges: ["Essai Gratuit", "Landing Pages"] },
      { name: "Optimizely", url: "https://www.optimizely.com", desc: "La solution leader mondiale pour l'expérimentation et le test A/B à grande échelle.", badges: ["Essai Gratuit", "A/B Testing"] },
      { name: "Clearscope", url: "https://www.clearscope.io", desc: "Optimisez vos contenus éditoriaux pour surpasser vos concurrents sur les mots-clés Google.", badges: ["Payant", "SEO Content"] },
      { name: "Google Keyword Planner", url: "https://ads.google.com/home/tools/keyword-planner/", desc: "L'outil de recherche de mots-clés officiel et gratuit de Google AdWords.", badges: ["100% Gratuit", "Mots-Clés"] },
      { name: "SE Ranking", url: "https://seranking.com", desc: "Une suite SEO tout-en-un très abordable et complète pour suivre vos positions Google.", badges: ["Essai Gratuit", "SEO Suite"] },
      { name: "VidIQ", url: "https://vidiq.com", desc: "L'extension incontournable pour optimiser vos vidéos YouTube et analyser les tendances.", badges: ["Freemium", "YouTube"] },
      { name: "Tubebuddy", url: "https://www.tubebuddy.com", desc: "Gestionnaire de chaîne et outil SEO vidéo officiel pour accélérer la croissance sur YouTube.", badges: ["Freemium", "YouTube SEO"] }
]
  },
  {
    id: "social-media",
    shortTitle: "Réseaux Sociaux",
    title: "Contenus & Réseaux Sociaux",
    description: "Les outils préférés des influenceurs et community managers.",
    icon: <Share2 size={20} />,
    color: "text-rose-500",
    tools: [
      { name: "Canva", url: "https:www.canva.com", desc: "Créer des visuels, miniatures YouTube et carrousels très facilement.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Metricool", url: "https:metricool.com", desc: "Analysez vos statistiques avancées et programmez vos posts sur tous les réseaux.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Buffer", url: "https:buffer.com", desc: "Outil simple et propre pour planifier la publication de vos contenus.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Linktree", url: "https:linktr.ee", desc: "Regroupez tous vos liens importants en un seul lien pour votre bio.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "ManyChat", url: "https:manychat.com", desc: "Le secret des créateurs : automatise les DMs Instagram (ex: 'Commente INFO').", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Snapseed", url: "https:snapseed.online", desc: "L'application de Google pour retoucher vos photos sur téléphone comme un pro.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "CapCut (Mobile)", url: "https:www.capcut.com", desc: "L'application indispensable pour monter vos TikToks, Reels et vidéos virales.", badges: ["Freemium", "Filigrane Désactivable"] },
      { name: "TweetDeck (X Pro)", url: "https:tweetdeck.twitter.com", desc: "Gérez plusieurs comptes Twitter (X) de manière professionnelle.", badges: ["Payant", "X Premium requis"] },
      { name: "Tweet Hunter", url: "https:tweethunter.io", desc: "Trouvez l'inspiration, rédigez et explosez vos vues sur Twitter et LinkedIn.", badges: ["Essai Gratuit", "Payant"] },
      { name: "Taplio", url: "https:taplio.com", desc: "Le petit frère de Tweet Hunter, mais spécifiquement conçu pour dominer LinkedIn.", badges: ["Essai Gratuit", "Payant"] },
      { name: "Publer", url: "https://publer.io", desc: "Superbe outil pour planifier et collaborer sur vos posts sur tous les réseaux sociaux importants.", badges: ["Freemium", "Planification"] },
      { name: "Klap", url: "https://klap.app", desc: "Transformez vos vidéos YouTube longues en Shorts verticaux et Reels viraux en un clic.", badges: ["Essai Gratuit", "Shorts IA"] },
      { name: "Headliner", url: "https://www.headliner.app", desc: "Transformez vos fichiers audio de podcasts en superbes vidéos d'audiogrammes pour vos réseaux.", badges: ["Freemium", "Audiogramme"] },
      { name: "Feedly", url: "https://feedly.com", desc: "Regroupez et organisez tous vos blogs, actualités et flux RSS préférés en un seul endroit.", badges: ["Freemium", "RSS Reader"] },
      { name: "Phantombuster", url: "https://phantombuster.com", desc: "Automatisez des actions de prospection (LinkedIn, Twitter) et extrayez des données cibles sans coder.", badges: ["Essai Gratuit", "Automatisation"] },
      { name: "CoSchedule", url: "https://coschedule.com", desc: "Calendrier de marketing complet pour planifier, organiser et exécuter vos campagnes de contenu.", badges: ["Freemium", "Calendrier"] },
      { name: "Agorapulse", url: "https://www.agorapulse.com", desc: "Une boîte de réception sociale unifiée et un outil de planification robuste pour les professionnels.", badges: ["Essai Gratuit", "Social Inbox"] },
      { name: "Brand24", url: "https://brand24.com", desc: "Suivez en temps réel les mentions de votre marque ou de vos concurrents sur tout le web.", badges: ["Essai Gratuit", "Social Listening"] },
      { name: "Beacons", url: "https://beacons.ai", desc: "Créez une page de bio mobile magnifique et optimisée pour vendre et connecter vos liens.", badges: ["Freemium", "Bio Builder"] },
      { name: "Linkin.bio by Later", url: "https://later.com/link-in-bio/", desc: "Transformez votre grille Instagram en une landing page cliquable et achetable.", badges: ["Freemium", "Bio Links"] },
      { name: "CapCut Online", url: "https://www.capcut.com/editor", desc: "Éditeur vidéo complet directement dans le navigateur, idéal pour le montage rapide et social.", badges: ["100% Gratuit", "Montage Web"] },
      { name: "Inoreader", url: "https://www.inoreader.com", desc: "Lecteur de flux RSS avancé pour suivre vos sources d'actualités et créer des flux d'inspiration.", badges: ["Freemium", "RSS Reader"] },
      { name: "SocialBu", url: "https://socialbu.com", desc: "Gérez et automatisez vos publications, réponses et flux de travail sur les réseaux sociaux.", badges: ["Freemium", "Automation"] },
      { name: "Mention", url: "https://mention.com", desc: "Outil de veille et d'écoute sociale pour surveiller votre réputation en ligne à chaque seconde.", badges: ["Essai Gratuit", "Monitoring"] }
]
  },
  {
    id: "video-ai",
    shortTitle: "Vidéo IA",
    title: "Montage & Vidéo IA",
    description: "Éditez vos vidéos 10x plus vite ou générez des vidéos depuis un texte.",
    icon: <Video size={20} />,
    color: "text-green-500",
    tools: [
      { name: "DaVinci Resolve", url: "https:www.blackmagicdesign.com/products/davinciresolve", desc: "Logiciel de montage hollywoodien, utilisé pour les grands films, 100% gratuit.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Opus Clip", url: "https:www.opus.pro", desc: "Transforme vos longues vidéos YouTube ou podcasts en dizaines de Shorts.", badges: ["Crédits Gratuits", "Avec Filigrane"] },
      { name: "HeyGen", url: "https:www.heygen.com", desc: "Créez des vidéos en tapant du texte avec un avatar IA ultra-réaliste qui parle pour vous.", badges: ["Essai Gratuit", "Avec Filigrane"] },
      { name: "Runway ML", url: "https:runwayml.com", desc: "La magie de la vidéo. Transformez une image ou un texte en une vraie vidéo.", badges: ["Crédits Gratuits", "Avec Filigrane"] },
      { name: "Synthesia", url: "https:www.synthesia.io", desc: "Le leader de l'avatar IA pour créer des vidéos de formation d'entreprise.", badges: ["Payant", "Essai Gratuit"] },
      { name: "InVideo IA", url: "https:invideo.io", desc: "Générez des vidéos YouTube entières (voix, images et montage) via un prompt.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Veed.io", url: "https:www.veed.io", desc: "Éditeur vidéo en ligne puissant, mondialement connu pour ses sous-titres animés automatiques.", badges: ["Freemium", "Avec Filigrane"] },
      { name: "Pika Labs", url: "https:pika.art", desc: "Générez des vidéos et animez des images gratuitement via Discord ou Web.", badges: ["Crédits Gratuits", "Avec Filigrane"] },
      { name: "Topaz Video AI", url: "https:www.topazlabs.com", desc: "Utilise l'IA pour augmenter la qualité, netteté et fluidité de vieilles vidéos (Upscale).", badges: ["Payant", "Avec Filigrane"] },
      { name: "CapCut Online", url: "https://www.capcut.com/editor", desc: "Éditeur vidéo complet directement dans le navigateur, idéal pour le montage rapide.", badges: ["100% Gratuit", "Montage Web"] },
      { name: "Captions.ai", url: "https://www.captions.ai", desc: "Générez des sous-titres animés captivants et éditez vos vidéos courtes avec l'IA.", badges: ["Essai Gratuit", "Sous-titres IA"] },
      { name: "Sora (OpenAI)", url: "https://openai.com/sora", desc: "Le modèle révolutionnaire d'OpenAI pour générer des vidéos photoréalistes à partir de texte.", badges: ["Accès Limité", "Vidéo IA"] },
      { name: "Vidnoz AI", url: "https://www.vidnoz.com", desc: "Créez des vidéos gratuites avec des avatars IA parlants réalistes en quelques minutes.", badges: ["Freemium", "Avatars IA"] },
      { name: "Colossyan", url: "https://www.colossyan.com", desc: "Créez des vidéos d'entreprise et de formation avec des avatars IA professionnels.", badges: ["Essai Gratuit", "Formation"] },
      { name: "DeepBrain AI", url: "https://www.deepbrain.io", desc: "Générez des vidéos explicatives de haute qualité en utilisant des avatars IA très naturels.", badges: ["Essai Gratuit", "Avatars IA"] },
      { name: "Elai.io", url: "https://elai.io", desc: "Transformez des présentations et des textes longs en vidéos avec des avatars en un clic.", badges: ["Essai Gratuit", "Text-to-Video"] },
      { name: "Synthesys", url: "https://synthesys.io", desc: "Générateur de voix off et de vidéos par IA pour vos contenus marketing commerciaux.", badges: ["Essai Gratuit", "AI Media"] },
      { name: "Adobe Premiere Rush", url: "https://www.adobe.com/products/premiere-rush.html", desc: "Application de montage vidéo mobile et desktop simple d'Adobe pour les créateurs.", badges: ["Freemium", "Montage"] },
      { name: "FlexClip", url: "https://www.flexclip.com", desc: "Éditeur de vidéo en ligne simple avec des milliers de modèles prêts à l'emploi.", badges: ["Freemium", "Modèles"] },
      { name: "Simpleshow", url: "https://simpleshow.com", desc: "Générez des vidéos explicatives animées en tableau blanc à partir de vos textes.", badges: ["Freemium", "Explication"] },
      { name: "Vyond", url: "https://www.vyond.com", desc: "Le logiciel professionnel pour créer des vidéos d'animation 2D personnalisées.", badges: ["Essai Gratuit", "Animation"] },
      { name: "Lumen5", url: "https://lumen5.com", desc: "Transformez automatiquement vos articles de blog en vidéos courtes pour les réseaux.", badges: ["Freemium", "Blog-to-Video"] },
      { name: "Wondershare Filmora", url: "https://filmora.wondershare.com", desc: "Logiciel de montage vidéo classique enrichi de puissantes fonctionnalités d'IA créatives.", badges: ["Essai Gratuit", "Montage"] }
]
  },
  {
    id: "images",
    shortTitle: "Générateurs d'Images",
    title: "Générateurs d'Images IA",
    description: "Les intelligences artificielles pour créer des illustrations époustouflantes.",
    icon: <ImageIcon size={20} />,
    color: "text-pink-500",
    tools: [
      { name: "Midjourney", url: "https:www.midjourney.com", desc: "Le leader incontesté. Des résultats artistiques et photoréalistes bluffants.", badges: ["Payant", "Abonnement requis"] },
      { name: "Leonardo.ai", url: "https:leonardo.ai", desc: "La meilleure alternative Freemium à Midjourney, avec des crédits gratuits quotidiens.", badges: ["Crédits Gratuits", "Sans Filigrane"] },
      { name: "DALL-E 3", url: "https:chat.openai.com", desc: "L'IA d'OpenAI. Comprend et respecte vos requêtes complexes à la perfection.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Ideogram", url: "https:ideogram.ai", desc: "La seule IA capable de générer du texte parfaitement lisible sur vos images (logos, affiches).", badges: ["Crédits Gratuits", "Sans Filigrane"] },
      { name: "Stable Diffusion", url: "https:stability.ai", desc: "IA open-source très puissante, installable en local (gratuit) pour éviter la censure.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Playground AI", url: "https:playgroundai.com", desc: "Une interface web simple pour créer et surtout faire des retouches d'images.", badges: ["Crédits Gratuits", "Sans Filigrane"] },
      { name: "Lexica", url: "https:lexica.art", desc: "Moteur de recherche pour s'inspirer d'images générées et récupérer les prompts.", badges: ["Crédits Gratuits", "Sans Filigrane"] },
      { name: "Freepik AI", url: "https:www.freepik.com/ai/image-generator", desc: "Le générateur ultra-rapide de Freepik, très utilisé pour des éléments graphiques.", badges: ["Crédits Gratuits", "Sans Filigrane"] },
      { name: "Adobe Firefly", url: "https://www.adobe.com/products/firefly.html", desc: "L'IA générative d'Adobe intégrée à Photoshop, sûre pour un usage commercial.", badges: ["Freemium", "Design"] },
      { name: "Canva Magic Studio", url: "https://www.canva.com/magic-studio/", desc: "La suite créative d'outils d'IA pour retoucher, éditer et générer des visuels en un instant.", badges: ["Freemium", "Design"] },
      { name: "Polarr Copilot", url: "https://copilot.polarr.co", desc: "Assistant intelligent pour retoucher vos photos et créer des filtres esthétiques uniques.", badges: ["Freemium", "Retouche"] },
      { name: "Fotor AI", url: "https://www.fotor.com", desc: "Éditeur de photos en ligne populaire avec des outils de génération d'art et d'amélioration d'image.", badges: ["Freemium", "Art Generator"] },
      { name: "Picsart AI", url: "https://picsart.com", desc: "Suite complète d'édition graphique et d'outils d'IA créative pour créateurs de contenu.", badges: ["Freemium", "Design Suite"] },
      { name: "Clipdrop", url: "https://clipdrop.co", desc: "Outils d'édition d'image par IA ultra-rapides (relighting, suppression d'objets, upscaling).", badges: ["Freemium", "Image Tools"] },
      { name: "Cutout.pro", url: "https://www.cutout.pro", desc: "Plateforme d'IA visuelle pour détourer des images et supprimer des éléments indésirables.", badges: ["Freemium", "Photo Editor"] },
      { name: "Photoroom", url: "https://www.photoroom.com", desc: "Le meilleur détourage et détourage produit par IA, idéal pour le commerce en ligne.", badges: ["Freemium", "Détourage"] },
      { name: "Artbreeder", url: "https://www.artbreeder.com", desc: "Créez et mélangez des portraits, paysages et personnages fantastiques de manière collaborative.", badges: ["Freemium", "Artistic"] },
      { name: "DeepAI", url: "https://deepai.org", desc: "Un générateur simple et rapide d'images à partir de texte avec plusieurs styles artistiques.", badges: ["Freemium", "Text-to-Image"] },
      { name: "Wombo Dream", url: "https://dream.ai", desc: "Générez des œuvres d'art numériques abstraites et colorées en quelques secondes depuis un prompt.", badges: ["Freemium", "Artistic"] },
      { name: "Hotpot.ai", url: "https://hotpot.ai", desc: "Outils d'IA pour générer des assets de jeux, logos, icônes et restaurer de vieilles photos.", badges: ["Freemium", "AI Assets"] },
      { name: "Pixelcut", url: "https://www.pixelcut.ai", desc: "Générez des photos de produits parfaites et des arrière-plans 3D en utilisant l'IA.", badges: ["Freemium", "Product Photo"] },
      { name: "Runway Image Tools", url: "https://runwayml.com", desc: "Suite d'édition créative d'images par IA pour l'inpainting, la génération et la variation.", badges: ["Freemium", "AI Image"] }
]
  },
  {
    id: "copywriting",
    shortTitle: "Copywriting",
    title: "Copywriting & Rédaction",
    description: "Rédigez des textes persuasifs, des emails ou corrigez vos fautes avec l'IA.",
    icon: <PenTool size={20} />,
    color: "text-orange-500",
    tools: [
      { name: "Jasper", url: "https:www.jasper.ai", desc: "L'outil IA historique spécialisé pour les copywriters et le marketing de contenu.", badges: ["Payant", "Essai Gratuit"] },
      { name: "Copy.ai", url: "https:www.copy.ai", desc: "Idéal pour écrire des fiches produits, des posts LinkedIn et des emails.", badges: ["Freemium", "Limité"] },
      { name: "Writesonic", url: "https:writesonic.com", desc: "Générateur d'articles de blog avec prise en compte du SEO naturel.", badges: ["Freemium", "Limité"] },
      { name: "Rytr", url: "https:rytr.me", desc: "Une alternative moins chère et plus simple que Jasper pour générer du petit texte.", badges: ["Freemium", "Limité"] },
      { name: "Deepl", url: "https:www.deepl.com", desc: "Le meilleur traducteur au monde, infiniment plus naturel que Google Translate.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "LanguageTool", url: "https:languagetool.org", desc: "Correcteur d'orthographe et de grammaire multi-langues gratuit.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "MerciApp", url: "https:www.merci-app.com", desc: "Le correcteur orthographique français de nouvelle génération.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Antidote", url: "https:www.antidote.info", desc: "Le logiciel de correction professionnel ultime en français.", badges: ["Payant", "Logiciel Unique"] },
      { name: "QuillBot", url: "https:quillbot.com", desc: "Reformule et améliore gratuitement n'importe quel texte de manière naturelle.", badges: ["Freemium", "Limité"] },
      { name: "WordAI", url: "https://wordai.com", desc: "Réécriture intelligente d'articles entiers pour les rendre totalement uniques et fluides.", badges: ["Essai Gratuit", "Réécriture"] },
      { name: "Copysmith", url: "https://copysmith.ai", desc: "Plateforme d'IA générative pour créer des descriptions de produits e-commerce en masse.", badges: ["Essai Gratuit", "E-commerce Copy"] },
      { name: "Scalenut", url: "https://www.scalenut.com", desc: "Plateforme SEO et d'écriture de contenu tout-en-un pour planifier et optimiser vos articles.", badges: ["Essai Gratuit", "SEO Writing"] },
      { name: "Simplified AI", url: "https://simplified.com", desc: "Outil tout-en-un pour rédiger, concevoir des graphismes et planifier sur les réseaux.", badges: ["Freemium", "All-in-One"] },
      { name: "Hypotenuse AI", url: "https://www.hypotenuse.ai", desc: "Générez des fiches produits, des articles de blog et des textes marketing de haute qualité.", badges: ["Essai Gratuit", "AI Copy"] },
      { name: "Copyhackers", url: "https://copyhackers.com", desc: "La ressource de référence mondiale pour apprendre le copywriting de conversion et d'impact.", badges: ["Ressources", "Formation"] },
      { name: "Peppertype", url: "https://www.peppertype.ai", desc: "Votre assistant virtuel d'écriture IA pour générer rapidement des posts sociaux.", badges: ["Freemium", "Social Copy"] },
      { name: "Neuroflash", url: "https://neuroflash.com", desc: "Le générateur de texte IA leader pour les langues européennes, optimisé pour le SEO.", badges: ["Freemium", "European AI"] },
      { name: "ContentBot", url: "https://contentbot.ai", desc: "IA avancée pour les blogueurs et les marketeurs pour automatiser la création de contenu.", badges: ["Essai Gratuit", "AI Writer"] },
      { name: "GrowthBar", url: "https://www.growthbarseo.com", desc: "Outil SEO et d'écriture de contenu pour faire des recherches de mots-clés et rédiger.", badges: ["Essai Gratuit", "SEO Writing"] },
      { name: "Lately", url: "https://www.lately.ai", desc: "L'IA qui réécrit et extrait des publications sociales à partir de vos vidéos ou blogs.", badges: ["Essai Gratuit", "Social Copy"] },
      { name: "Outranking", url: "https://www.outranking.io", desc: "Planifiez, recherchez et rédigez du contenu optimisé pour le SEO à l'aide de l'IA.", badges: ["Essai Gratuit", "SEO Content"] }
]
  },
  {
    id: "business",
    shortTitle: "Business & IA",
    title: "Business & Productivité",
    description: "Assistants virtuels et logiciels incontournables pour gagner des heures chaque jour.",
    icon: <Sparkles size={20} />,
    color: "text-amber-500",
    tools: [
      { name: "Notion", url: "https:www.notion.so", desc: "L'outil ultime d'organisation. Transformez votre vie en système complet.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Claude 3 (Anthropic)", url: "https:claude.ai", desc: "Excellente alternative à ChatGPT, réputée pour une écriture très humaine et nuancée.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Perplexity AI", url: "https:www.perplexity.ai", desc: "Le moteur de recherche IA. Il lit le web et résume avec de vraies sources.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Gamma App", url: "https:gamma.app", desc: "L'IA génère un Pitch Deck (présentation PowerPoint) magnifique en 30s.", badges: ["Crédits Gratuits", "Avec Filigrane"] },
      { name: "Tome", url: "https:tome.app", desc: "Outil de storytelling visuel interactif, parfait pour expliquer un projet.", badges: ["Crédits Gratuits", "Avec Filigrane"] },
      { name: "Fathom", url: "https:fathom.video", desc: "S'invite dans vos Zoom/Google Meet, transcrit tout et vous envoie le résumé.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Chatbase", url: "https:www.chatbase.co", desc: "Uploadez vos PDF, et obtenez un Chatbot IA qui connait tout sur votre business.", badges: ["Crédits Gratuits", "Avec Filigrane"] },
      { name: "Trello", url: "https:trello.com", desc: "Gestion Kanban très simple pour vos tâches personnelles ou d'équipe.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Slack", url: "https:slack.com", desc: "L'outil de messagerie pour communiquer proprement en entreprise.", badges: ["Freemium", "Limité"] },
      { name: "Heptabase", url: "https://heptabase.com", desc: "Outil de prise de notes visuel sous forme de cartes pour mieux organiser vos pensées complexes.", badges: ["Essai Gratuit", "Productivité"] },
      { name: "Linear", url: "https://linear.app", desc: "Le gestionnaire de projets de référence pour les équipes de développement produit rapides.", badges: ["Freemium", "Gestion de Projet"] },
      { name: "Raycast", url: "https://www.raycast.com", desc: "Un lanceur ultra-rapide et extensible pour Mac qui remplace Spotlight et automatise tout.", badges: ["100% Gratuit", "Mac Utility"] },
      { name: "Microsoft Copilot", url: "https://www.microsoft.com/en-us/microsoft-copilot", desc: "L'assistant IA intégré dans la suite Office pour rédiger, analyser et créer des données.", badges: ["Freemium", "Office AI"] },
      { name: "Superhuman", url: "https://superhuman.com", desc: "Le client de messagerie le plus rapide jamais conçu, pensé pour vous faire gagner des heures.", badges: ["Essai Gratuit", "Email"] },
      { name: "Akiflow", url: "https://akiflow.com", desc: "Centralisez vos tâches et votre calendrier en un seul outil de planification quotidien hyper-efficace.", badges: ["Essai Gratuit", "Calendrier"] },
      { name: "Motion", url: "https://www.usemotion.com", desc: "L'agenda intelligent qui utilise l'IA pour planifier automatiquement vos journées de travail.", badges: ["Essai Gratuit", "AI Calendar"] },
      { name: "SaneBox", url: "https://www.sanebox.com", desc: "Nettoyez automatiquement votre boîte de réception en filtrant les e-mails non importants.", badges: ["Essai Gratuit", "Email Utility"] },
      { name: "Alfred", url: "https://www.alfredapp.com", desc: "L'outil de productivité classique pour Mac pour lancer des applications et automatiser des raccourcis.", badges: ["Freemium", "Mac Utility"] },
      { name: "MindMeister", url: "https://www.mindmeister.com", desc: "Le meilleur outil de mind-mapping en ligne pour brainstormer et collaborer visuellement.", badges: ["Freemium", "Mind-mapping"] },
      { name: "Evernote", url: "https://evernote.com", desc: "L'application de prise de notes historique pour archiver et organiser vos documents.", badges: ["Freemium", "Notes"] },
      { name: "Fellow.app", url: "https://fellow.app", desc: "Optimisez vos réunions d'équipe en créant des ordres du jour collaboratifs et des notes.", badges: ["Freemium", "Réunions"] },
      { name: "Slab", url: "https://slab.com", desc: "Créez une base de connaissances (wiki) interne moderne et épurée pour vos équipes.", badges: ["Essai Gratuit", "Wiki"] },
      { name: "Coda", url: "https://coda.io", desc: "Le document tout-en-un qui réunit les mots, les tableaux et les applications puissantes.", badges: ["Freemium", "Workspace"] }
]
  },
  {
    id: "free-ai",
    shortTitle: "100% Gratuit IA",
    title: "Outils IA 100% Gratuits",
    description: "Une sélection exclusive d'intelligences artificielles totalement gratuites ou Open Source.",
    icon: <Sparkles size={20} />,
    color: "text-green-500",
    tools: [
      { name: "HuggingFace", url: "https://huggingface.co/chat/", desc: "L'équivalent de ChatGPT, totalement gratuit avec les meilleurs modèles Open Source (Llama 3, Mixtral).", badges: ["100% Gratuit", "Open Source"] },
      { name: "Ollama", url: "https://ollama.com", desc: "Faites tourner des IA (LLM) comme Llama 3 directement sur votre ordinateur, sans internet et gratuitement.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Vectorizer.ai", url: "https://vectorizer.ai", desc: "Convertit instantanément vos images pixélisées (PNG/JPG) en graphiques vectoriels (SVG) de qualité infinie.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "CapCut Desktop", url: "https://www.capcut.com", desc: "Le logiciel de montage vidéo le plus intuitif du marché avec fonctions de sous-titrage automatique IA.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Obsidian", url: "https://obsidian.md", desc: "Un Second Cerveau local et puissant pour stocker et lier vos notes personnelles au format Markdown.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Perplexity AI", url: "https://www.perplexity.ai", desc: "Le meilleur moteur de recherche IA. Parfait pour remplacer Google. Utilisation illimitée gratuite.", badges: ["Freemium", "Illimité"] },
      { name: "Claude (Sonnet 3.5)", url: "https://claude.ai", desc: "Meilleur que ChatGPT pour coder et écrire en français. La version gratuite est extrêmement généreuse.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Microsoft Copilot", url: "https://copilot.microsoft.com", desc: "Accédez à GPT-4 et DALL-E 3 gratuitement, financé par Microsoft.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Pinokio", url: "https://pinokio.computer", desc: "Un navigateur magique qui installe n'importe quelle IA open source en un clic sur votre PC.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Suno AI", url: "https://suno.com", desc: "Générez des chansons entières (paroles et musiques) de qualité studio gratuitement chaque jour.", badges: ["Crédits Gratuits", "Audio"] },
      { name: "ElevenLabs", url: "https://elevenlabs.io", desc: "Le meilleur générateur de voix IA au monde. Des milliers de caractères gratuits chaque mois.", badges: ["Freemium", "Haute Qualité"] },
      { name: "LM Studio", url: "https://lmstudio.ai", desc: "Découvrez, téléchargez et discutez avec n'importe quelle IA locale, tout ça hors-ligne.", badges: ["100% Gratuit", "Local"] },
      { name: "Krea AI", url: "https://www.krea.ai", desc: "Génération et upscaling d'images en temps réel. Incroyablement puissant et gratuit.", badges: ["Freemium", "Sans Filigrane"] },
      { name: "Civitai", url: "https://civitai.com", desc: "La plus grande plateforme pour trouver des modèles de génération d'images IA (Stable Diffusion).", badges: ["100% Gratuit", "Open Source"] },
      { name: "Phind", url: "https://www.phind.com", desc: "Moteur de recherche IA conçu spécifiquement pour les développeurs. Réponses très rapides.", badges: ["100% Gratuit", "Sans Filigrane"] },
      { name: "Krita (avec extension AI)", url: "https://krita.org", desc: "Logiciel de dessin pro et gratuit open source dopé à l'IA pour générer et retoucher vos créations.", badges: ["100% Gratuit", "Open Source"] },
      { name: "AudioCraft (Meta)", url: "https://github.com/facebookresearch/audiocraft", desc: "Modèle de recherche open-source de Meta pour générer de la musique et des sons de haute qualité.", badges: ["100% Gratuit", "Music AI"] },
      { name: "OpenAssistant", url: "https://open-assistant.io", desc: "Un assistant de chat conversationnel open-source et collaboratif respectueux de vos données.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Stable Video Diffusion", url: "https://stability.ai/news/stable-video-diffusion-open-source-video-model", desc: "Le modèle de génération de vidéo open-source révolutionnaire de Stability AI.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Bark (Suno)", url: "https://github.com/suno-ai/bark", desc: "Modèle audio open-source basé sur des transformateurs pour générer de la parole et des sons réalistes.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Riffusion", url: "https://www.riffusion.com", desc: "Générez de la musique en temps réel en utilisant des spectrogrammes d'images.", badges: ["100% Gratuit", "Music AI"] },
      { name: "FastChat (lmsys)", url: "https://chat.lmsys.org", desc: "Plateforme ouverte pour entraîner, évaluer et comparer les chatbots IA en temps réel.", badges: ["100% Gratuit", "AI Arena"] },
      { name: "Stable Audio Open", url: "https://stability.ai/news/stable-audio-open", desc: "Modèle ouvert de Stability AI pour générer des échantillons audio et des effets sonores.", badges: ["100% Gratuit", "Audio AI"] },
      { name: "LocalAI", url: "https://localai.io", desc: "Alternative gratuite open-source auto-hébergée aux APIs d'OpenAI exécutée localement.", badges: ["100% Gratuit", "Local API"] },
      { name: "Flowise", url: "https://flowiseai.com", desc: "Interface utilisateur no-code pour créer vos applications LLM et flux de travail personnalisés.", badges: ["100% Gratuit", "Open Source"] },
      { name: "Langflow", url: "https://www.langflow.org", desc: "Prototypez visuellement des applications d'IA multi-agents et des flux de travail RAG rapidement.", badges: ["100% Gratuit", "Open Source"] },
      { name: "OpenWebUI", url: "https://openwebui.com", desc: "Interface web conviviale et magnifique pour interagir avec vos modèles LLM locaux (Ollama).", badges: ["100% Gratuit", "Open Source"] },
      { name: "LibreChat", url: "https://www.librechat.ai", desc: "Une interface de chat open-source unifiée prenant en charge plusieurs fournisseurs d'IA (OpenAI, Claude).", badges: ["100% Gratuit", "Open Source"] },
      { name: "Automatic1111", url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui", desc: "L'interface web de référence pour faire tourner Stable Diffusion localement et générer des images.", badges: ["100% Gratuit", "Open Source"] }
]
  }
]

export const freeCombosData = [
  {
    title: "Créer une vidéo virale (TikTok/Reel) en 15 min",
    goal: "Produire des shorts viraux de qualité professionnelle sans montrer son visage et sans dépenser 1€.",
    tools: ["Claude 3.5 Sonnet", "Leonardo.ai", "CapCut Desktop"],
    steps: [
      "Rédigez le script de la vidéo en utilisant Claude 3.5 Sonnet avec un prompt axé sur la rétention (ex: 'MrBeast style').",
      "Générez des illustrations de haute qualité ou des arrière-plans sur Leonardo.ai (150 crédits gratuits par jour).",
      "Assemblez le tout dans CapCut Desktop. Utilisez la fonction de synthèse vocale gratuite pour la voix-off, puis générez les sous-titres automatiques en 1 clic."
    ],
    time: "15 min",
    cost: "0€ (100% Gratuit)"
  },
  {
    title: "Créer et héberger un site web ou portfolio pro",
    goal: "Concevoir un site web moderne, ultra-rapide et l'héberger en ligne avec un nom de domaine gratuit.",
    tools: ["v0.dev", "Cursor", "Netlify / Vercel"],
    steps: [
      "Générez l'interface et le design complet de votre site en React/Tailwind sur v0.dev via un simple prompt.",
      "Copiez le code généré dans Cursor pour personnaliser les textes, liens et images à votre guise.",
      "Créez un compte gratuit sur Netlify ou Vercel, et glissez-déposez le dossier de votre projet pour le mettre en ligne instantanément."
    ],
    time: "30 min",
    cost: "0€ (Hébergement à vie)"
  },
  {
    title: "Créer un logo vectoriel haute définition",
    goal: "Créer un logo moderne avec du texte lisible et l'obtenir au format vectoriel (grand format sans pixel).",
    tools: ["Ideogram.ai", "Vectorizer.ai", "Canva"],
    steps: [
      "Générez le concept de logo avec du texte parfaitement intégré sur Ideogram.ai (ex: 'Un logo minimaliste pour une marque nommée Mylta').",
      "Téléchargez le logo et passez-le dans Vectorizer.ai pour convertir l'image (PNG/JPG) en un fichier vectoriel (SVG) de qualité infinie.",
      "Importez le SVG dans Canva pour créer votre charte graphique et vos bannières de réseaux sociaux."
    ],
    time: "10 min",
    cost: "0€ (Zéro outil payant)"
  },
  {
    title: "Créer un système d'organisation et prise de notes",
    goal: "Bâtir un 'Second Cerveau' pour centraliser ses tâches, projets et lectures de manière totalement privée et gratuite.",
    tools: ["Obsidian", "Ollama", "Notion"],
    steps: [
      "Installez Obsidian en local sur votre ordinateur pour stocker vos notes au format Markdown standard (sans cloud, 100% privé).",
      "Faites tourner Ollama avec le modèle Llama 3 en local pour interroger vos notes et rédiger sans connexion internet.",
      "Utilisez Notion pour la gestion visuelle de vos projets collaboratifs et calendriers de tâches."
    ],
    time: "20 min",
    cost: "0€ (Stockage local illimité)"
  },
  {
    title: "Création de Shorts/Reels en masse",
    goal: "Générer des dizaines de vidéos courtes à partir de textes en quelques minutes.",
    tools: ["ChatGPT","Canva","Google Sheets"],
    steps: ["Demandez à ChatGPT de générer 30 citations ou faits intéressants.","Collez ces données dans un tableau Google Sheets et téléchargez en CSV.","Importez le CSV dans Canva via l'outil 'Création en bloc' pour générer 30 vidéos d'un coup."],
    time: "20 min",
    cost: "0€ (Tout en gratuit)"
  },
  {
    title: "Podcast IA 100% Automatisé",
    goal: "Créer un podcast audio hyper-réaliste avec deux voix IA qui débattent.",
    tools: ["NotebookLM","Spotify for Podcasters"],
    steps: ["Importez vos notes, PDF ou articles de blog dans Google NotebookLM.","Générez un 'Audio Overview' pour obtenir un podcast réaliste de deux IA qui discutent de votre document.","Publiez gratuitement l'audio sur Spotify for Podcasters."],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Avatar Parlant Vidéo",
    goal: "Créer un présentateur IA qui lit votre texte sans montrer votre visage.",
    tools: ["Leonardo.ai","SadTalker","CapCut"],
    steps: ["Générez une image réaliste d'une personne avec Leonardo.ai.","Utilisez l'extension SadTalker (HuggingFace/Local) pour animer le visage de l'image avec un fichier audio.","Montez et ajoutez des sous-titres avec CapCut."],
    time: "30 min",
    cost: "0€ (Open Source + Free Tiers)"
  },
  {
    title: "Clonage Vocal Parfait",
    goal: "Cloner votre propre voix pour doubler des vidéos sans devoir parler au micro.",
    tools: ["ElevenLabs","Audacity"],
    steps: ["Enregistrez un échantillon clair de votre voix (1-2 minutes) avec Audacity.","Uploadez l'échantillon sur ElevenLabs (Instant Voice Cloning).","Générez de l'audio à l'infini avec votre propre voix en tapant simplement du texte."],
    time: "15 min",
    cost: "Freemium (ou ~5€/mois)"
  },
  {
    title: "Création de Site E-Commerce Express",
    goal: "Lancer une boutique en ligne gratuite pour tester un produit.",
    tools: ["Ecwid","Canva"],
    steps: ["Créez vos designs de produits et logos avec Canva.","Créez un compte Ecwid gratuit (jusqu'à 5 produits sans frais d'abonnement).","Connectez votre boutique à vos réseaux sociaux et commencez à vendre."],
    time: "45 min",
    cost: "0€ (+ frais de transaction)"
  },
  {
    title: "Newsletter Automatisée IA",
    goal: "Lancer une newsletter professionnelle rédigée en partie par l'IA.",
    tools: ["Perplexity","Substack"],
    steps: ["Faites une recherche approfondie sur un sujet de niche avec Perplexity AI pour obtenir des sources fiables.","Demandez à Claude ou ChatGPT de synthétiser la recherche en format newsletter.","Publiez et monétisez gratuitement avec Substack."],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Générateur d'Idées de Business",
    goal: "Trouver une idée de business rentable et créer un plan d'action.",
    tools: ["Phind","Notion IA"],
    steps: ["Cherchez des tendances de marché pour développeurs ou entrepreneurs avec Phind.","Utilisez les templates Notion pour structurer votre business model canvas.","Aidez-vous de l'IA de Notion pour brainstormer le nom et les offres."],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Résumé de Vidéos YouTube Longues",
    goal: "Extraire le jus d'une vidéo d'une heure en 2 minutes de lecture.",
    tools: ["YouTube Transcript","Claude 3.5"],
    steps: ["Copiez le script de la vidéo YouTube via des extensions gratuites ou le bouton Transcript.","Collez le texte massif dans Claude 3.5 Sonnet (qui a une grande fenêtre de contexte).","Demandez un résumé en bullet points et des plans d'action concrets."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Traduction de Vidéos Virales",
    goal: "Traduire vos vidéos dans 10 langues différentes avec la même voix.",
    tools: ["CapCut","ElevenLabs (Optionnel)"],
    steps: ["Importez votre vidéo sur CapCut Desktop.","Utilisez la fonction 'Auto-Translate' pour traduire les sous-titres.","Générez les voix de synthèse dans la nouvelle langue directement via CapCut."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Génération de Musiques Libres de Droits",
    goal: "Créer une bande son originale pour vos vidéos ou jeux.",
    tools: ["Suno AI","CapCut"],
    steps: ["Entrez un prompt décrivant l'humeur et le genre musical sur Suno.com.","Téléchargez le MP3 généré (2 chansons gratuites par jour).","Ajoutez-le en fond sonore sur CapCut."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Création de Pitch Deck (Présentation)",
    goal: "Créer des slides magnifiques pour présenter un projet ou une startup.",
    tools: ["Gamma.app","Unsplash"],
    steps: ["Tapez simplement l'idée de votre projet sur Gamma.app.","L'IA génère les textes, la structure et le design complet des 10 slides.","Personnalisez les images avec la banque Unsplash intégrée."],
    time: "10 min",
    cost: "0€ (Freemium)"
  },
  {
    title: "Rédaction d'Articles SEO",
    goal: "Ecrire un article de blog optimisé pour se classer sur Google.",
    tools: ["ChatGPT","Google Keyword Planner"],
    steps: ["Trouvez un mot-clé pertinent et gratuit via Google Keyword Planner.","Demandez à ChatGPT de rédiger un article structuré avec des balises H2, H3.","Relisez et ajoutez votre touche personnelle."],
    time: "25 min",
    cost: "0€"
  },
  {
    title: "Application Mobile Sans Code",
    goal: "Créer une app pour votre business sans savoir coder.",
    tools: ["Glide","Google Sheets"],
    steps: ["Créez la base de données de votre app dans un simple fichier Google Sheets.","Connectez-le à Glide Apps.","L'interface de l'application est générée automatiquement et publiée sous forme d'app PWA."],
    time: "1 heure",
    cost: "0€ (Plan gratuit)"
  },
  {
    title: "Automatisation Instagram (Bot MP)",
    goal: "Envoyer un lien automatiquement à tous ceux qui commentent votre Reel.",
    tools: ["ManyChat","Instagram"],
    steps: ["Connectez ManyChat à votre compte Instagram Pro.","Créez un flux: 'Si le commentaire contient [MOT]', envoyer un Message Privé.","Demandez à l'audience de commenter pour recevoir votre ressource gratuite."],
    time: "15 min",
    cost: "0€ (Jusqu'à 1000 contacts)"
  },
  {
    title: "Web Scraping (Extraction de données)",
    goal: "Extraire tous les contacts ou produits d'un site web.",
    tools: ["Apify","Google Sheets"],
    steps: ["Trouvez un scraper gratuit sur le store d'Apify (ex: Instagram Scraper).","Laissez l'outil tourner sur le profil cible.","Exportez les résultats en CSV et nettoyez-les dans Google Sheets."],
    time: "20 min",
    cost: "0€ (Crédits de départ)"
  },
  {
    title: "Création de CV Parfait",
    goal: "Refaire son CV pour décrocher n'importe quel job.",
    tools: ["ChatGPT","Canva"],
    steps: ["Donnez votre CV actuel et l'offre d'emploi à ChatGPT. Demandez d'optimiser les mots-clés.","Prenez le texte généré et insérez-le dans un template moderne sur Canva.","Exportez en PDF."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Miniatures YouTube Virales",
    goal: "Faire des miniatures au style MrBeast avec un fort taux de clic.",
    tools: ["Photopea","Leonardo.ai","Remove.bg"],
    steps: ["Générez un fond hyper coloré et intrigant avec Leonardo.ai.","Prenez une photo de vous très expressive, et détourez-la avec Remove.bg.","Assemblez et ajoutez du contraste/texte sur Photopea (le Photoshop web gratuit)."],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Création de Fiches Produits",
    goal: "Traduire et améliorer des fiches produits Aliexpress/Amazon.",
    tools: ["DeepL","ChatGPT"],
    steps: ["Copiez la fiche produit basique ou étrangère.","Traduisez avec DeepL si besoin pour une traduction naturelle.","Demandez à ChatGPT d'appliquer un framework de Copywriting (AIDA) sur le produit."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Photos Produits Pro",
    goal: "Créer des packshots dignes d'un studio professionnel pour du e-commerce.",
    tools: ["Photoroom"],
    steps: ["Prenez votre produit en photo avec votre téléphone (même sur une table moche).","Importez-le dans l'application Photoroom.","L'IA détoure le produit et génère un fond studio réaliste (ombres incluses)."],
    time: "3 min",
    cost: "0€ (Avec watermark facile à enlever)"
  },
  {
    title: "Bot Service Client IA",
    goal: "Créer un chatbot qui répond aux questions de vos clients 24/7.",
    tools: ["Botpress","ChatGPT"],
    steps: ["Créez un compte Botpress (Gratuit).","Fournissez le lien de votre site web ou une FAQ PDF pour que le bot s'entraîne dessus.","Intégrez le code widget sur votre site web."],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Montage Vidéo Dynamique Automatique",
    goal: "Découper de longues interviews en dizaines de Shorts viraux.",
    tools: ["Opus Clip"],
    steps: ["Collez le lien YouTube d'un long podcast sur Opus Clip.","L'IA analyse les moments les plus intéressants et génère des extraits courts.","Les sous-titres dynamiques et les zooms sont ajoutés automatiquement."],
    time: "10 min",
    cost: "Freemium (Crédits gratuits mensuels)"
  },
  {
    title: "Planification de Contenu",
    goal: "Programmer 1 mois de posts sur tous les réseaux.",
    tools: ["Notion","Metricool"],
    steps: ["Préparez et rédigez vos posts dans un calendrier Notion.","Connectez Metricool à vos réseaux sociaux (gratuit jusqu'à 50 posts/mois).","Copiez/collez et planifiez les dates."],
    time: "2 heures",
    cost: "0€"
  },
  {
    title: "Création de Lead Magnets (E-book)",
    goal: "Créer un PDF gratuit à offrir en échange d'emails.",
    tools: ["ChatGPT","Canva"],
    steps: ["Structurez un petit guide 'Comment faire X en 3 étapes' avec ChatGPT.","Trouvez un template de E-book ou présentation sur Canva.","Mettez en page et ajoutez des visuels gratuits."],
    time: "45 min",
    cost: "0€"
  },
  {
    title: "Veille Concurrentielle",
    goal: "Savoir tout ce que vos concurrents publient.",
    tools: ["Feedly","Google Alerts"],
    steps: ["Configurez Google Alerts sur le nom de vos concurrents.","Ajoutez les blogs de votre secteur dans Feedly.","Lisez chaque matin un résumé des nouveautés."],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Transcription de Réunions (Google Meet)",
    goal: "Avoir des comptes rendus de réunions parfaits sans rien noter.",
    tools: ["Otter.ai","Fireflies.ai"],
    steps: ["Installez l'extension Chrome de Fireflies ou Otter.","Connectez-vous à votre Google Meet / Zoom.","L'IA participe, transcrit tout ce qui est dit et vous envoie un résumé par mail."],
    time: "Automatique",
    cost: "0€ (Limites de base)"
  },
  {
    title: "Analyse de Données Complexes",
    goal: "Trouver des tendances dans vos ventes ou vos stats.",
    tools: ["ChatGPT Advanced Data Analysis","Google Sheets"],
    steps: ["Exportez vos données de ventes, visites, ou finances en CSV.","Uploadez le fichier dans ChatGPT (version gratuite limite à quelques messages).","Demandez: 'Génère des graphiques et dis-moi quels produits performent le mieux'."],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Création de Logos Génératifs",
    goal: "Avoir 100 idées de logos en 2 minutes.",
    tools: ["Bing Image Creator (DALL-E 3)"],
    steps: ["Utilisez Bing Image Creator (gratuit).","Entrez : 'A minimalist vector logo for a coffee shop named Bean, white background'.","Répétez pour obtenir différentes variantes."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Organisation de Voyages/Déplacements",
    goal: "Créer un itinéraire parfait de A à Z.",
    tools: ["Perplexity","Google Maps"],
    steps: ["Demandez à Perplexity: 'Fais un itinéraire de 3 jours à Rome pour un couple, budget moyen, avec les adresses et temps de trajet'.","Enregistrez les adresses dans une liste Google Maps partagée.","Profitez du voyage sans stress."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Révision de Contrats / Juridique basique",
    goal: "Comprendre les conditions d'un contrat obscur.",
    tools: ["Claude 3.5 Sonnet"],
    steps: ["Copiez/collez le contrat ou uploadez le PDF dans Claude.","Demandez: 'Résume les obligations, les pièges potentiels et les dates clés de ce contrat de façon très simple'.","Attention : l'IA ne remplace pas un avocat, mais c'est un bon premier filtre."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Amélioration de Prompts IA",
    goal: "Devenir un Prompt Engineer sans effort.",
    tools: ["PromptPerfect","ChatGPT"],
    steps: ["Tapez une demande brouillon ('fais un poème sur la pluie').","Demandez à ChatGPT: 'Agis comme un expert en Prompt Engineering, améliore mon prompt pour avoir le meilleur résultat possible.'","Utilisez le nouveau prompt complexe généré."],
    time: "2 min",
    cost: "0€"
  },
  {
    title: "Générateur de Shorts Automatique",
    goal: "Créer 100 Shorts en 1h.",
    tools: ["ChatGPT","Canva","ElevenLabs"],
    steps: ["Générez des faits intéressants avec ChatGPT.","Copiez-les dans Canva avec l'outil de création en vrac.","Ajoutez une voix ElevenLabs."],
    time: "60 min",
    cost: "0€"
  },
  {
    title: "Résumé de Podcast Viral",
    goal: "Créer des extraits TikTok de podcast.",
    tools: ["Opus Clip","YouTube"],
    steps: ["Prenez le lien d'un podcast populaire.","Collez-le dans Opus Clip.","L'IA génère 10 clips viraux avec sous-titres."],
    time: "10 min",
    cost: "0€ (essai)"
  },
  {
    title: "Cloneur de Voix pour Faceless",
    goal: "Faire parler n'importe qui.",
    tools: ["ElevenLabs","D-ID","Midjourney"],
    steps: ["Générez une image sur Midjourney.","Clonez une voix sur ElevenLabs.","Animez le visage avec D-ID."],
    time: "15 min",
    cost: "0€ (essai)"
  },
  {
    title: "Bot de Vente Instagram",
    goal: "Vendre automatiquement en DM.",
    tools: ["ManyChat","ChatGPT","Instagram"],
    steps: ["Créez un Reel qui dit 'Commente X'.","Configurez ManyChat pour répondre au mot clé.","Le bot envoie le lien d'affiliation."],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Boutique E-commerce IA",
    goal: "Créer un shop complet sans effort.",
    tools: ["Shopify","ChatGPT","Midjourney"],
    steps: ["Trouvez la niche avec ChatGPT.","Générez les logos et bannières avec Midjourney.","Rédigez les fiches produits avec l'IA."],
    time: "45 min",
    cost: "0€"
  },
  {
    title: "Création de Musique Lo-Fi",
    goal: "Générer une chaîne YouTube musicale 24/7.",
    tools: ["Suno AI","Leonardo.ai","CapCut"],
    steps: ["Générez la musique sur Suno AI.","Créez une animation en boucle sur Leonardo.","Montez une vidéo d'1h sur CapCut."],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Devenir Freelance Copywriter",
    goal: "Rédiger des pages de vente sans être pro.",
    tools: ["Claude 3.5 Sonnet","Google Docs"],
    steps: ["Trouvez un client.","Utilisez Claude pour écrire avec le framework PAS.","Livrez le texte formaté sur Google Docs."],
    time: "25 min",
    cost: "0€"
  },
  {
    title: "Traduire des Vidéos YouTube",
    goal: "Toucher l'audience internationale.",
    tools: ["HeyGen","YouTube"],
    steps: ["Téléchargez votre vidéo française.","Uploadez sur HeyGen pour traduire en anglais (clonage vocal et labial).","Publiez sur une chaîne US."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Création d'E-book Automatique",
    goal: "Vendre un E-book sur Amazon KDP.",
    tools: ["ChatGPT","Canva","Amazon KDP"],
    steps: ["Générez les chapitres avec ChatGPT.","Mettez en page sur un template Canva.","Publiez gratuitement sur Kindle Direct Publishing."],
    time: "2h",
    cost: "0€"
  },
  {
    title: "Analyse SEO des Concurrents",
    goal: "Voler le trafic des concurrents.",
    tools: ["Ubersuggest","ChatGPT","WordPress"],
    steps: ["Analysez les mots clés du concurrent sur Ubersuggest.","Demandez à ChatGPT d'écrire un article 2x plus long.","Publiez sur votre blog."],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Générateur de Posts LinkedIn",
    goal: "Devenir Top Voice LinkedIn.",
    tools: ["Taplio","Claude","LinkedIn"],
    steps: ["Trouvez les posts viraux sur Taplio.","Réécrivez-les avec votre propre style via Claude.","Programmez vos posts pour le mois."],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Assistant Service Client IA",
    goal: "Remplacer le SAV.",
    tools: ["Chatbase","Site Web"],
    steps: ["Importez les documents de votre site sur Chatbase.","L'IA apprend toutes vos infos.","Intégrez le chatbot sur votre site en 1 clic."],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Veille Concurrentielle Automatisée",
    goal: "Savoir ce que font les autres.",
    tools: ["Feedly","ChatGPT","Slack"],
    steps: ["Ajoutez les blogs concurrents sur Feedly.","Utilisez Zapier pour envoyer les nouveaux articles à ChatGPT.","Recevez un résumé sur Slack."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Création de Logos en Masse",
    goal: "Vendre des logos sur Fiverr.",
    tools: ["Midjourney","Vectorize.ai"],
    steps: ["Générez des logos sur Midjourney.","Vectorisez-les gratuitement.","Vendez-les à vos clients 50€ pièce."],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Newsletter Curated Auto",
    goal: "Créer une newsletter comme Morning Brew.",
    tools: ["Beehiiv","Perplexity"],
    steps: ["Demandez à Perplexity les 5 grosses actus du jour.","Reformulez avec un ton amusant.","Envoyez sur Beehiiv (gratuit jusqu'à 2500 subs)."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Création de Présentation Pitch Deck",
    goal: "Lever des fonds ou vendre un service.",
    tools: ["Gamma.app","ChatGPT"],
    steps: ["Écrivez le plan avec ChatGPT.","Collez le texte dans Gamma.","L'IA génère les slides, images et design instantanément."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Automatisation de Prospection B2B",
    goal: "Trouver des clients en dormant.",
    tools: ["Apollo.io","Lemlist","ChatGPT"],
    steps: ["Scrappez 1000 emails sur Apollo.","Écrivez une séquence avec ChatGPT.","Lancez la campagne sur Lemlist."],
    time: "40 min",
    cost: "0€"
  },
  {
    title: "Créateur de CV Parfait",
    goal: "Trouver un emploi rapidement.",
    tools: ["Canva","ChatGPT"],
    steps: ["Prenez l'offre d'emploi.","Demandez à ChatGPT d'optimiser votre CV pour cette offre (mots clés).","Utilisez un beau template Canva."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Génération de Code Python",
    goal: "Créer des scripts sans savoir coder.",
    tools: ["Cursor","Python"],
    steps: ["Ouvrez Cursor Editor.","Appuyez sur Cmd+K et demandez 'un script de scraping web'.","Exécutez le code généré directement."],
    time: "5 min",
    cost: "0€"
  },
  {
    title: "Création d'Application Mobile",
    goal: "Créer une app iOS/Android sans code.",
    tools: ["FlutterFlow","Firebase"],
    steps: ["Dessinez l'interface sur FlutterFlow.","Générez la base de données Firebase en 1 clic.","Publiez sur les stores."],
    time: "3h",
    cost: "0€"
  },
  {
    title: "Création de Formations en Ligne",
    goal: "Lancer un cours vidéo.",
    tools: ["Notion","Tella.tv","Systeme.io"],
    steps: ["Écrivez le plan sur Notion.","Enregistrez votre écran avec Tella.","Hébergez et vendez sur Systeme.io gratuitement."],
    time: "2h",
    cost: "0€"
  },
  {
    title: "Générateur d'Histoires pour Enfants",
    goal: "Vendre des livres illustrés.",
    tools: ["ChatGPT","Midjourney","Amazon KDP"],
    steps: ["Écrivez l'histoire avec ChatGPT.","Générez les illustrations style Pixar avec Midjourney.","Publiez le livre."],
    time: "2h",
    cost: "0€"
  },
  {
    title: "Automatisation Instagram Complète",
    goal: "Gérer un compte de niche auto.",
    tools: ["Make.com","ChatGPT","Instagram"],
    steps: ["Make récupère l'actu du jour.","ChatGPT crée un post et image.","Make publie sur Instagram. Tout en automatique."],
    time: "1h",
    cost: "0€"
  },
  {
    title: "Assistant Comptable Personnel",
    goal: "Gérer ses finances intelligemment.",
    tools: ["ChatGPT Data Analysis","Excel"],
    steps: ["Exportez vos relevés bancaires.","Importez-les dans ChatGPT.","Demandez une analyse de vos dépenses inutiles."],
    time: "10 min",
    cost: "0€"
  },
  {
    title: "Génération de Quiz Viraux",
    goal: "Créer du contenu interactif.",
    tools: ["Interact","ChatGPT"],
    steps: ["Générez des questions psychologiques avec ChatGPT.","Mettez-les sur Interact.","Récoltez des milliers d'emails via le quiz."],
    time: "20 min",
    cost: "0€"
  },
  {
    title: "Création de Voix Off Documentaire",
    goal: "Faire des vidéos style Netflix.",
    tools: ["ElevenLabs","CapCut"],
    steps: ["Écrivez le script du docu.","Utilisez une voix grave (ex: Marcus) sur ElevenLabs.","Ajoutez des musiques épiques sur CapCut."],
    time: "30 min",
    cost: "0€"
  },
  {
    title: "Traduire un Site Web Entier",
    goal: "Passer à l'international.",
    tools: ["Weglot","ChatGPT"],
    steps: ["Installez Weglot sur votre site (trad auto).","Réparez les petites erreurs avec ChatGPT.","Attirez des clients du monde entier."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Création d'Art IA",
    goal: "Vendre des posters sur Etsy.",
    tools: ["Midjourney","Printify","Etsy"],
    steps: ["Générez des toiles abstraites sur Midjourney.","Placez-les sur des posters via Printify.","Listez-les sur Etsy sans gérer les stocks."],
    time: "45 min",
    cost: "0€"
  },
  {
    title: "Résumé de Vidéo en PDF",
    goal: "Créer un lead magnet rapidement.",
    tools: ["YouTube","ChatGPT","Canva"],
    steps: ["Copiez le transcript YouTube.","Demandez un résumé propre à ChatGPT.","Créez un PDF sur Canva pour récolter des emails."],
    time: "15 min",
    cost: "0€"
  },
  {
    title: "Rédaction de Poésie/Chansons",
    goal: "Créer de l'art écrit.",
    tools: ["ChatGPT","Suno AI"],
    steps: ["Générez des paroles émotionnelles avec ChatGPT.","Importez-les dans Suno AI pour créer la chanson.","Publiez sur Spotify via un distributeur."],
    time: "20 min",
    cost: "0€"
  }
]


export const masterclassCategories = [
  {
    id: "business",
    name: "Business & Vente",
    title: "Business, Vente & Tunnels",
    desc: "Les techniques les plus agressives et rentables pour convertir de simples visiteurs en clients fidèles.",
    icon: <ShoppingCart size={18} />,
    color: "text-orange-500",
    strategies: [
      {
        title: "100M$ Offers (Alex Hormozi)",
        icon: <ShoppingCart className="text-orange-500" size={24} />,
        color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
        desc: "L'art de créer une offre irrésistible.",
        points: [
          "🎁 Ajoute des bonus pour gonfler la valeur perçue.",
          "⚡️ Raccourcis le temps d'attente vers le résultat.",
          "🛡️ Retire le risque (Garantie forte ou 'Satisfait ou Remboursé')."
        ]
      },
      {
        title: "Hook, Story, Offer (Russell Brunson)",
        icon: <PenTool className="text-emerald-500" size={24} />,
        color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
        desc: "Le framework secret pour vendre en ligne.",
        points: [
          "🎣 HOOK : Stoppe le scroll de l'utilisateur.",
          "📖 STORY : Raconte une histoire vraie qui crée l'empathie.",
          "🔥 OFFER : Balance ton offre magique à la fin."
        ]
      },
      {
        title: "Le Copywriting Brutal (Tugan Bara)",
        icon: <Zap className="text-red-600 dark:text-red-400" size={24} />,
        color: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/20",
        desc: "Frappe directement là où ça fait mal.",
        points: [
          "🩸 Parle des douleurs profondes, pas des caractéristiques.",
          "😈 Trouve un ennemi commun à abattre (le système, les banques...).",
          "💊 Présente ton produit comme l'unique pilule de secours."
        ]
      },
      {
        title: "Le Modèle AARRR (Growth Hacking)",
        icon: <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />,
        color: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-500/20",
        desc: "Le tunnel des startups de la Silicon Valley.",
        points: [
          "🧲 Acquisition : Fais venir du trafic en masse.",
          "✨ Activation : Provoque l'effet 'Wahou' chez le visiteur.",
          "💸 Revenu & Rétention : Fais payer, et fais-les revenir."
        ]
      },
      {
        title: "Le Testing Rapide (Yomi Denzel)",
        icon: <Rocket className="text-pink-500" size={24} />,
        color: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-500/20",
        desc: "Ne perds pas 3 mois sur un produit incertain.",
        points: [
          "⏱️ Crée ta boutique express en 2 heures max.",
          "💸 Dépense juste 50€ en pub (TikTok ou Meta).",
          "🔪 Si ça marche : Scale. Si ça flop : Coupe tout sans regret."
        ]
      },
      {
        title: "La Stratégie de l'Océan Bleu",
        icon: <Layout className="text-sky-500" size={24} />,
        color: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20",
        desc: "Crée ta propre catégorie.",
        points: [
          "🦈 Fuis les 'Océans Rouges' (marchés pleins de concurrents).",
          "🎨 Combine 2 marchés pour créer ta propre niche vierge.",
          "🏆 Ne cherche pas à être le 'meilleur', sois le 'seul'."
        ]
      }
    ]
  },
  {
    id: "mindset",
    name: "Productivité & Mindset",
    title: "Productivité & Modèles Mentaux",
    desc: "Optimisez votre cerveau, gagnez du temps et prenez de meilleures décisions stratégiques.",
    icon: <Brain size={18} />,
    color: "text-blue-500",
    strategies: [
      {
        title: "Le Second Brain (Ali Abdaal)",
        icon: <Brain className="text-blue-500" size={24} />,
        color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
        desc: "Ton cerveau sert à penser, pas à retenir.",
        points: [
          "📥 Capture absolument TOUT ce que tu vois (Notion, Obsidian).",
          "📂 Organise l'information de manière visuelle.",
          "🚀 Crée des projets à partir de tes propres notes."
        ]
      },
      {
        title: "Le Levier (Naval Ravikant)",
        icon: <TrendingUp className="text-yellow-500" size={24} />,
        color: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20",
        desc: "Le travail dur ne rend pas riche. Le levier, oui.",
        points: [
          "🚫 Argent et Employés nécessitent la permission d'autrui.",
          "💻 Le code (logiciel) et les médias (vidéos) sont infinis.",
          "😴 Crée des choses qui travaillent pour toi pendant que tu dors."
        ]
      },
      {
        title: "La Loi de Pareto 80/20 (Tim Ferriss)",
        icon: <Zap className="text-teal-500" size={24} />,
        color: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20",
        desc: "Concentre-toi sur l'essentiel.",
        points: [
          "🎯 80% de tes résultats viennent de 20% de tes actions.",
          "🗑️ Supprime ou délègue les 80% de tâches futiles.",
          "⭐ Isole et maîtrise ta zone de génie."
        ]
      },
      {
        title: "La Règle du 1% (Atomic Habits)",
        icon: <TrendingUp className="text-fuchsia-500" size={24} />,
        color: "bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-500/20",
        desc: "Le succès est l'accumulation de petites victoires.",
        points: [
          "📈 Vise seulement 1% d'amélioration chaque jour.",
          "🔄 Focalise-toi sur un bon système, pas sur un objectif.",
          "🗓️ À la fin de l'année, tu seras 37 fois meilleur."
        ]
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Création",
    title: "Marketing, Contenu & Rétention",
    desc: "L'art de capter l'attention sur les réseaux sociaux et de construire une audience fidèle.",
    icon: <Mic size={18} />,
    color: "text-purple-500",
    strategies: [
      {
        title: "La Règle des 3 Secondes (MrBeast)",
        icon: <Video className="text-red-500" size={24} />,
        color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
        desc: "L'attention est rare. Tout se joue au début.",
        points: [
          "🚨 Si ça ne claque pas en 3 secondes, tu as perdu.",
          "🤯 Ton intro doit promettre une valeur énorme immédiatement.",
          "✂️ Coupe tous les silences et va droit au but."
        ]
      },
      {
        title: "Le Storytelling de l'Échec (Oussama Ammar)",
        icon: <Mic className="text-purple-500" size={24} />,
        color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
        desc: "Les gens achètent ton histoire, pas ton produit.",
        points: [
          "📉 Ne parle pas que de tes succès (ça paraît arrogant).",
          "💔 Raconte tes galères, tes doutes, tes échecs passés.",
          "🫂 C'est la vulnérabilité qui soude une vraie tribu."
        ]
      },
      {
        title: "Le Système de Création (Justin Welsh)",
        icon: <Share2 className="text-blue-600 dark:text-blue-400" size={24} />,
        color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20",
        desc: "Automatise ton contenu sans t'épuiser.",
        points: [
          "✍️ Écris 1 format très long par semaine (ex: Newsletter).",
          "✂️ Découpe-le en 6 posts courts pour tes réseaux.",
          "♻️ Analyse ce qui marche et vends-le en produit numérique."
        ]
      },
      {
        title: "Les 1000 Vrais Fans (Kevin Kelly)",
        icon: <Star className="text-indigo-500" size={24} />,
        color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
        desc: "Pas besoin de millions d'abonnés pour vivre.",
        points: [
          "❤️ Trouve 1000 fans prêts à acheter tout ce que tu fais.",
          "💰 S'ils payent 100€/an = tu gagnes 100 000€.",
          "🤝 Privilégie une audience petite mais ultra-engagée."
        ]
      },
      {
        title: "Start With Why (Simon Sinek)",
        icon: <GraduationCap className="text-cyan-500" size={24} />,
        color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20",
        desc: "Ils n'achètent pas ce que tu fais, mais pourquoi tu le fais.",
        points: [
          "🌍 POURQUOI : Explique ta mission et tes croyances.",
          "⚙️ COMMENT : Montre ton processus unique.",
          "📦 QUOI : Enfin, présente ton produit final."
        ]
      }
    ]
  },

  {
    id: "videos",
    name: "📺 Vidéos Offertes",
    title: "Vidéos YouTube & Ressources",
    desc: "Les meilleures masterclasses gratuites sur YouTube proposant des ressources en bio.",
    icon: <Youtube size={18} />,
    color: "text-red-500",
    videos: [
      {
        id: "v1",
        title: "30 Outils IA Secrets (100% Gratuits)",
        channel: "Léo Duff / Tech",
        desc: "Une liste incroyable d'outils IA moins connus mais surpuissants. Regardez la description pour récupérer son fichier complet Notion offert.",
        url: "https:www.youtube.com/results?search_query=leo+duff+outils+ia",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v2",
        title: "Comment Créer une Appli sans Coder en 1H",
        channel: "Shubham Sharma",
        desc: "Le roi du No-Code en France. Il montre comment utiliser FlutterFlow et Make, et offre souvent ses 'Blueprints' d'automatisation en Bio.",
        url: "https:www.youtube.com/results?search_query=shubham+sharma+no+code",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v3",
        title: "Créer un Business avec 0 Audience",
        channel: "Antoine BM",
        desc: "Comment lancer un projet rentable sans personne pour vous écouter au départ. Antoine offre souvent des PDF gratuits ou des cartes mentales dans sa description.",
        url: "https:www.youtube.com/results?search_query=antoine+bm+0+audience",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v4",
        title: "Comment j'ai revendu mon SaaS 150M$",
        channel: "Guillaume Moubeche",
        desc: "Le CEO de Lemlist explique sa stratégie de Cold Emailing. Un condensé de valeur brute avec des templates d'emails souvent offerts dans la bio.",
        url: "https:www.youtube.com/results?search_query=guillaume+moubeche+lemlist",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v5",
        title: "La méthode pour trouver des clients (0 à 10k/mois)",
        channel: "Yomi Denzel / E-com",
        desc: "Les stratégies exactes d'acquisition client. Dans ses bios, il propose souvent des formations de base gratuites ou des ressources E-commerce.",
        url: "https:www.youtube.com/results?search_query=yomi+denzel+trouver+des+clients",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v6",
        title: "Apprendre Webflow de A à Z (Tutoriel Complet)",
        channel: "Théo Lion",
        desc: "La meilleure introduction pour créer des sites professionnels. Vérifiez la description pour des liens vers des templates Webflow gratuits.",
        url: "https:www.youtube.com/results?search_query=theo+lion+webflow",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v7",
        title: "Analyse Psychologique : Pourquoi MrBeast Réussit ?",
        channel: "Marketing Mania",
        desc: "Stan Leloup décrypte les stratégies de rétention et de psychologie humaine. Un document d'analyse est très souvent disponible en description.",
        url: "https:www.youtube.com/results?search_query=marketing+mania+mrbeast",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v8",
        title: "Comment devenir un Monstre de Productivité",
        channel: "Oussama Ammar",
        desc: "Ses meilleures méthodes pour travailler de façon radicale et sans distraction. Plusieurs liens utiles et recommandations de livres en dessous de la vidéo.",
        url: "https:www.youtube.com/results?search_query=oussama+ammar+productivite",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v9",
        title: "Devenir Indépendant Financièrement avec l'IA",
        channel: "Tugan Bara",
        desc: "Analyse brutale du marché actuel et comment l'exploiter avec le copywriting. Toujours des masterclass offertes via les liens en bio.",
        url: "https:www.youtube.com/results?search_query=tugan+bara+copywriting+ia",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v10",
        title: "Le Guide Ultime de la Publicité Facebook Ads",
        channel: "Joseph Rousseau / J&J",
        desc: "Une formation littéralement offerte sur YouTube par les experts francophones de l'e-commerce. Leurs templates de ciblage sont souvent en lien externe.",
        url: "https:www.youtube.com/results?search_query=facebook+ads+guide+complet",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v11",
        title: "Comment générer 10k/mois avec Youtube 'Cash Cow'",
        channel: "Oseille TV",
        desc: "Tutoriel complet sur la création de chaînes Youtube automatisées (sans montrer sa tête). Liste d'outils recommandés disponible dans la description.",
        url: "https:www.youtube.com/results?search_query=oseille+tv+cash+cow",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v12",
        title: "L'État d'Esprit d'un Millionnaire (Mindset)",
        channel: "Alec Henry",
        desc: "Vaincre ses peurs, vaincre la procrastination et oser se lancer dans l'entrepreneuriat. Souvent accompagné d'une offre d'audit gratuit en description.",
        url: "https:www.youtube.com/results?search_query=alec+henry+mindset",
        icon: <Youtube className="text-red-500" size={32} />
      }
    ]
  },
  {
    id: "free-credits",
    shortTitle: "Crédits Gratuits",
    title: "Top 20 : Sites à Crédits Gratuits",
    description: "Une sélection de 20 sites géniaux qui offrent des crédits gratuits tous les jours ou à l'inscription pour générer des images, vidéos et musiques.",
    icon: <Zap size={20} />,
    color: "text-yellow-500",
    tools: [
      { name: "Vidnoz AI", url: "https://www.vidnoz.com", desc: "Offre 1 minute de génération de vidéo gratuite par jour avec des avatars réalistes.", badges: ["1 min/Jour", "Vidéo"] },
      { name: "D-ID", url: "https://www.d-id.com", desc: "Générez des vidéos à partir de portraits parlants animés. Offre des crédits gratuits lors de l'inscription.", badges: ["Essai Gratuit", "Vidéo"] },
      { name: "Clipdrop AI", url: "https://clipdrop.co", desc: "Offre des crédits quotidiens gratuits pour utiliser leurs outils d'IA (détourage, nettoyage, relight).", badges: ["Gratuit/Jour", "Images"] },
      { name: "Tripo3D", url: "https://www.tripo3d.ai", desc: "Générez des modèles 3D de haute qualité à partir d'images ou de texte avec des crédits quotidiens gratuits.", badges: ["Crédits/Jour", "3D"] },
      { name: "Genmo", url: "https://www.genmo.ai", desc: "Générez des animations vidéo et des images fantastiques. Offre des crédits gratuits tous les jours.", badges: ["Gratuit/Jour", "Vidéo"] }
    ]
  }

]


export const labIdeasData = [
  {
    title: "Comment l'IA de 2026 a remplacé 90% de mon travail",
    type: "TikTok / Reel",
    niche: "Tech / Business",
    difficulty: "Moyen",
    virality: 98,
    steps: [
      "Faire un hook choc sur l'IA générative en 2026",
      "Montrer un workflow complètement automatisé sur l'écran",
      "Conclure avec un appel à l'action pour s'abonner"
    ]
  },
  {
    title: "Le secret de l'algorithme Instagram en 2027",
    type: "Carrousel Insta",
    niche: "Marketing",
    difficulty: "Facile",
    virality: 95,
    steps: [
      "Page 1: Titre accrocheur avec un chiffre fou",
      "Pages 2-5: Décomposer la nouvelle métrique d'engagement",
      "Page 6: L'astuce pour hacker cette métrique dès aujourd'hui"
    ]
  },
  {
    title: "3 Business à lancer en 2027 avec 0€",
    type: "TikTok",
    niche: "Entrepreneuriat",
    difficulty: "Facile",
    virality: 99,
    steps: [
      "Hook visuel très dynamique (style fast-paced)",
      "Lister 3 niches inexplorées grâce aux nouvelles technos",
      "Finir par 'Le dernier est le plus rentable'"
    ]
  },
  {
    title: "Mon setup VR pour travailler en 2026",
    type: "Reel Insta",
    niche: "Lifestyle / Tech",
    difficulty: "Difficile",
    virality: 92,
    steps: [
      "Montrer une transition fluide réalité vs réalité virtuelle",
      "Expliquer comment la VR double la productivité",
      "Demander en commentaire : 'Prêt à travailler comme ça ?'"
    ]
  },
  {
    title: "Pourquoi les influenceurs disparaîtront en 2027",
    type: "Vidéo Courte",
    niche: "Analyse / Controverse",
    difficulty: "Moyen",
    virality: 97,
    steps: [
      "Hook polémique sur la fin de l'influence humaine",
      "Introduire les influenceurs IA hyper-réalistes",
      "Inviter au débat dans la section commentaires"
    ]
  },
  {
    title: "Hacker sa dopamine : La méthode 2026",
    type: "TikTok",
    niche: "Développement Personnel",
    difficulty: "Facile",
    virality: 94,
    steps: [
      "Utiliser un filtre sombre/esthétique",
      "Expliquer le concept de 'Dopamine Fasting 2.0'",
      "Donner un plan d'action sur 3 jours"
    ]
  },
  {
    title: "Créer une marque de vêtements en 2h (Version 2027)",
    type: "Reel / TikTok",
    niche: "E-commerce",
    difficulty: "Difficile",
    virality: 96,
    steps: [
      "Générer le design avec l'IA text-to-3D",
      "Connecter à une usine print-on-demand automatisée",
      "Lancer des pubs générées par IA"
    ]
  },
  {
    title: "Les métiers qui paient 10k/mois en 2026",
    type: "Carrousel Insta",
    niche: "Finance / Carrière",
    difficulty: "Facile",
    virality: 89,
    steps: [
      "Slide 1: 'Oublie le code, fais ça.'",
      "Lister des métiers comme 'Prompt Architect', 'AI Ethicist'",
      "Proposer une formation gratuite en lien bio"
    ]
  },
  {
    title: "Je vis dans le Metavers pendant 24h",
    type: "Mini-Vlog TikTok",
    niche: "Divertissement",
    difficulty: "Difficile",
    virality: 98,
    steps: [
      "Filmer des extraits de la vie en réalité mixte",
      "Montrer des interactions drôles ou absurdes",
      "Bilan de l'expérience à la fin"
    ]
  },
  {
    title: "Le meilleur outil de 2026 que personne ne connaît",
    type: "Reel Insta",
    niche: "Outils / Tech",
    difficulty: "Facile",
    virality: 93,
    steps: [
      "Hook: 'Ne scrolle pas si tu veux gagner du temps'",
      "Démo rapide et bluffante de l'outil à l'écran",
      "Demander de commenter 'LIEN' pour recevoir l'outil en DM"
    ]
  }
]


