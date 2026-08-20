const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const blogPosts = [
  {
    title: "Introduction to Claude 3: La Nouvelle Ère de l'IA",
    slug: "introduction-claude-3-nouvelle-ere-ia",
    summary: "Découvrez les capacités fascinantes de Claude 3, le modèle d'IA développé par Anthropic.",
    content: "<h2>Qu'est-ce que Claude 3 ?</h2><p>Claude 3 est la dernière génération de modèles d'intelligence artificielle développée par Anthropic. Il se décline en trois versions : Haiku, Sonnet et Opus. Opus est le modèle le plus puissant, capable de rivaliser avec les meilleurs modèles du marché comme GPT-4. Il excelle dans la compréhension du contexte, la rédaction créative, et l'analyse de données complexes.</p><h3>Pourquoi choisir Claude ?</h3><p>Contrairement à d'autres modèles, Claude a été conçu avec une approche axée sur la sécurité et la constitutionnalité de l'IA. Il est moins enclin à générer du contenu nuisible et fait preuve d'une grande subtilité dans ses réponses.</p>",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "ChatGPT vs Claude : Lequel Choisir en 2026 ?",
    slug: "chatgpt-vs-claude-lequel-choisir",
    summary: "Une comparaison détaillée entre les deux géants de l'intelligence artificielle conversationnelle.",
    content: "<h2>Comparaison des Fonctionnalités</h2><p>ChatGPT d'OpenAI et Claude d'Anthropic dominent le paysage de l'IA. ChatGPT brille par son écosystème massif et ses plugins. Claude, en revanche, se démarque par sa fenêtre de contexte immense (pouvant analyser des livres entiers en une seule fois) et son style d'écriture souvent perçu comme plus naturel et moins 'robotique'.</p><h3>Le Verdict</h3><p>Si vous avez besoin d'intégration avec l'écosystème Microsoft ou d'outils vocaux avancés, ChatGPT reste un choix solide. Pour l'analyse de longs documents ou la rédaction nuancée, Claude prend l'avantage.</p>",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Comment utiliser l'IA pour doubler votre productivité",
    slug: "utiliser-ia-doubler-productivite",
    summary: "Des astuces concrètes pour intégrer l'IA dans votre quotidien professionnel.",
    content: "<h2>L'IA au quotidien</h2><p>L'intelligence artificielle n'est plus de la science-fiction, c'est votre nouvel assistant de bureau. Vous pouvez utiliser des outils comme Claude pour résumer vos e-mails, rédiger des comptes rendus de réunions, ou même générer du code.</p><h3>Automatisation</h3><p>En combinant l'IA avec des outils comme Zapier ou Make, vous pouvez créer des flux de travail automatisés. Par exemple, chaque e-mail client important peut être analysé par l'IA pour en extraire le sentiment et suggérer une réponse instantanée.</p>",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Prompt Engineering : L'Art de Parler à l'IA",
    slug: "prompt-engineering-art-parler-ia",
    summary: "Maîtrisez la création de prompts pour obtenir exactement ce que vous voulez des IA comme Claude.",
    content: "<h2>Les bases du Prompt Engineering</h2><p>Un 'prompt' est la consigne que vous donnez à l'IA. La qualité de la réponse dépend directement de la précision de votre prompt. La règle d'or est le contexte : donnez à l'IA un rôle (ex: 'Agis comme un expert en marketing'), définissez le public cible, et structurez la sortie attendue.</p><h3>Techniques avancées</h3><p>Utilisez des exemples (few-shot prompting) pour montrer à l'IA ce que vous attendez. Pour des problèmes complexes, demandez à l'IA de réfléchir étape par étape (Chain of Thought).</p>",
    thumbnail: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "L'Avenir de l'Éducation à l'Ère de l'IA",
    slug: "avenir-education-ere-ia",
    summary: "Comment l'Intelligence Artificielle transforme les méthodes d'apprentissage.",
    content: "<h2>Tutorat Personnalisé</h2><p>L'IA permet d'offrir un tutorat personnalisé à chaque élève. Des modèles comme Claude peuvent adapter leurs explications au niveau de compréhension de l'étudiant, rendant l'apprentissage plus interactif et moins frustrant.</p><h3>Défis</h3><p>La question du plagiat et de la triche reste un enjeu majeur. Les éducateurs doivent repenser les évaluations pour se concentrer sur la pensée critique plutôt que sur la simple restitution d'informations.</p>",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Génération d'Images avec l'IA : Le Guide Pratique",
    slug: "generation-images-ia-guide-pratique",
    summary: "Créez des visuels époustouflants avec Midjourney, DALL-E et autres IA génératives.",
    content: "<h2>L'évolution de la génération d'images</h2><p>La création visuelle assistée par IA a fait des bonds de géant. Il suffit aujourd'hui d'une simple description textuelle pour générer des photographies photoréalistes, des illustrations ou des designs 3D.</p><h3>Midjourney vs DALL-E</h3><p>Midjourney excelle dans l'esthétique et les rendus artistiques, tandis que DALL-E 3 est exceptionnel pour suivre fidèlement des prompts complexes et intégrer du texte dans les images.</p>",
    thumbnail: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Les Considérations Éthiques de l'Intelligence Artificielle",
    slug: "considerations-ethiques-intelligence-artificielle",
    summary: "Biais, sécurité et impact sociétal : les grands défis de l'IA.",
    content: "<h2>Le défi des biais cognitifs</h2><p>Les IA apprennent à partir de données humaines, et elles héritent de nos biais. Il est crucial pour les entreprises développant ces modèles (comme Anthropic avec Claude) d'implémenter des gardes-fous pour éviter les discriminations.</p><h3>L'impact sur l'emploi</h3><p>L'IA automatisera de nombreuses tâches, ce qui suscite des craintes pour l'emploi. Cependant, elle créera également de nouvelles opportunités et nécessitera une transition vers des rôles où l'empathie et la créativité humaine restent irremplaçables.</p>",
    thumbnail: "https://images.unsplash.com/photo-1516245834210-c4c14271569b?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "La Fenêtre de Contexte de Claude Expliquée",
    slug: "fenetre-contexte-claude-expliquee",
    summary: "Comment Claude parvient à analyser des centaines de pages en quelques secondes.",
    content: "<h2>Qu'est-ce qu'une fenêtre de contexte ?</h2><p>La fenêtre de contexte est la quantité d'informations qu'une IA peut 'garder en mémoire' pendant une interaction. Claude se distingue par une fenêtre allant jusqu'à 200 000 tokens, soit environ un livre de 500 pages.</p><h3>Cas d'usage</h3><p>Cela permet aux développeurs et analystes de fournir à Claude des rapports financiers entiers, de longs historiques de code ou des contrats juridiques, et de lui demander de synthétiser, trouver des anomalies ou répondre à des questions précises sur le texte fourni.</p>",
    thumbnail: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Créer des Agents IA Autonomes",
    slug: "creer-agents-ia-autonomes",
    summary: "De simples chatbots aux agents capables d'exécuter des tâches complexes.",
    content: "<h2>L'ère des Agents</h2><p>Nous passons de l'IA qui 'parle' à l'IA qui 'agit'. Les agents IA peuvent naviguer sur le web, utiliser des API, lire des bases de données et prendre des décisions pour accomplir un objectif donné.</p><h3>Outils pour développeurs</h3><p>Des frameworks comme LangChain ou AutoGen facilitent la création de ces agents. Vous pouvez doter Claude d'outils spécifiques (accès à internet, exécution de code) pour en faire un collaborateur virtuel redoutable.</p>",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "L'Évolution des LLM (Large Language Models)",
    slug: "evolution-llm-large-language-models",
    summary: "Retour sur l'histoire fascinante des modèles de langage de grande taille.",
    content: "<h2>De l'architecture Transformer à aujourd'hui</h2><p>L'article 'Attention is All You Need' publié en 2017 a révolutionné le domaine avec l'architecture Transformer. Depuis, la course à la taille et aux performances n'a cessé de s'accélérer.</p><h3>La tendance open-source</h3><p>Face aux modèles propriétaires fermés, des modèles open-source comme Llama 3 de Meta offrent des performances impressionnantes, permettant aux chercheurs et développeurs de déployer leurs propres LLM localement et en toute confidentialité.</p>",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Top 5 des Applications de Montage Vidéo Gratuites",
    slug: "top-5-applications-montage-video-gratuites",
    summary: "Les meilleures applications pour monter vos vidéos directement sur votre smartphone.",
    content: "<h2>CapCut : Le roi incontesté</h2><p>Propulsé par Bytedance (la société mère de TikTok), CapCut offre des fonctionnalités dignes de logiciels professionnels : suppression d'arrière-plan, sous-titres automatiques, et une bibliothèque immense d'effets.</p><h3>Alternatives solides</h3><p>VN Video Editor est excellent pour une interface épurée sans filigrane. iMovie reste un incontournable pour les utilisateurs d'iPhone, tandis que InShot est parfait pour le formatage rapide destiné aux réseaux sociaux.</p>",
    thumbnail: "https://images.unsplash.com/photo-1626908013943-df94de54984c?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Monter des TikToks et Reels comme un Pro",
    slug: "monter-tiktoks-reels-comme-pro",
    summary: "Les secrets du montage court et percutant pour retenir l'attention de l'audience.",
    content: "<h2>Le 'Hook' ou l'accroche</h2><p>Les 3 premières secondes sont cruciales. Utilisez des coupes franches (jump cuts) pour éliminer tous les silences et maintenir un rythme effréné. L'action doit démarrer instantanément.</p><h3>Texte dynamique et zooms</h3><p>Ajoutez des sous-titres animés au centre de l'écran (où se pose le regard). Utilisez des effets de zoom subtils sur les moments clés pour dynamiser l'image, même si vous parlez face caméra.</p>",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Masterclass CapCut : Astuces Cachées",
    slug: "masterclass-capcut-astuces-cachees",
    summary: "Poussez CapCut dans ses retranchements avec ces techniques peu connues.",
    content: "<h2>Les Keyframes (Images Clés)</h2><p>L'utilisation des images clés vous permet de créer des animations personnalisées. Vous pouvez animer un texte pour qu'il suive le mouvement de votre main, ou créer un effet de zoom progressif ultra-fluide.</p><h3>Masques et Superpositions</h3><p>L'outil superposition (overlay) combiné aux masques permet de créer des effets dignes d'Hollywood : faire apparaître un texte derrière vous, ou cloner votre sujet dans la même vidéo.</p>",
    thumbnail: "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "L'Éclairage Parfait pour Vos Vidéos Smartphone",
    slug: "eclairage-parfait-videos-smartphone",
    summary: "Pas besoin de caméras coûteuses, tout est question de lumière.",
    content: "<h2>La lumière naturelle : votre meilleure amie</h2><p>Placez-vous face à une fenêtre pour bénéficier d'une lumière douce et flatteuse. Évitez à tout prix le contre-jour, à moins que vous ne cherchiez à créer un effet de silhouette.</p><h3>L'éclairage artificiel abordable</h3><p>Une simple Ring Light ou un panneau LED d'appoint (key light) suffit. Pensez à utiliser une lumière de contre (backlight) derrière vous pour vous détacher de l'arrière-plan et donner un look cinématographique.</p>",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Secrets d'Enregistrement Audio sur Mobile",
    slug: "secrets-enregistrement-audio-mobile",
    summary: "L'audio représente 50% de la qualité perçue d'une vidéo. Ne le négligez pas.",
    content: "<h2>Oubliez le micro intégré</h2><p>Le microphone de votre smartphone capte trop de bruit ambiant. Investissez dans un micro-cravate (lavalier) sans fil abordable (comme ceux de Hollyland ou Rode) pour un son professionnel instantané.</p><h3>Le traitement audio dans CapCut</h3><p>Utilisez l'outil de réduction de bruit de votre application de montage pour éliminer les souffles, et augmentez légèrement les basses et les aigus avec l'égaliseur pour donner de la 'présence' à votre voix.</p>",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Filmer des B-Rolls Cinématographiques à l'iPhone",
    slug: "filmer-b-rolls-cinematographiques-iphone",
    summary: "Comment capturer des plans de coupe qui donnent un aspect premium à vos vidéos.",
    content: "<h2>Mouvement et Stabilité</h2><p>Un B-Roll cinématographique implique souvent un mouvement fluide. Utilisez la stabilisation intégrée de votre téléphone (Mode Action sur iPhone) ou investissez dans un stabilisateur (gimbal) comme le DJI Osmo Mobile.</p><h3>Varier les angles et les vitesses</h3><p>Filmez à 60fps ou 120fps pour créer de superbes ralentis. Alternez entre des plans très serrés (macro), des plans moyens, et des plans larges pour donner de la profondeur à votre histoire visuelle.</p>",
    thumbnail: "https://images.unsplash.com/photo-1512446733611-9099a758e236?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Transitions et Effets : Les Bonnes Pratiques",
    slug: "transitions-effets-bonnes-pratiques",
    summary: "Comment utiliser les transitions sans que votre vidéo ait l'air amateur.",
    content: "<h2>Moins, c'est plus</h2><p>Évitez les transitions extravagantes (étoiles, balayages complexes) qui font très 'amateur'. Préférez la coupe simple (cut) qui est la base du cinéma.</p><h3>Transitions fluides (Speed Ramps et J-Cuts)</h3><p>Pour lier deux plans, utilisez des mouvements de caméra : terminez un plan par un mouvement de pan rapide et commencez le suivant par le même mouvement. Le J-Cut (le son du plan suivant commence avant l'image) est redoutable pour fluidifier une interview.</p>",
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Color Grading (Étalonnage) sur Smartphone",
    slug: "color-grading-etalonnage-smartphone",
    summary: "Donnez une ambiance unique à vos vidéos grâce à l'étalonnage colorimétrique.",
    content: "<h2>Correction vs Étalonnage</h2><p>La première étape est la correction : ajuster l'exposition, le contraste et la balance des blancs pour avoir une image 'neutre'. Ensuite vient l'étalonnage : donner un style (plus chaud, plus froid, contraste dramatique).</p><h3>Utilisation des LUTs</h3><p>De nombreuses applications permettent d'importer des LUTs (Look Up Tables), qui sont des préréglages de couleurs professionnels (comme des filtres Instagram, mais en mieux). Utilisez-les avec parcimonie en réduisant leur intensité à 70% ou 80%.</p>",
    thumbnail: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "Paramètres d'Exportation pour YouTube et Instagram",
    slug: "parametres-exportation-youtube-instagram",
    summary: "Ne gâchez pas votre beau montage avec un mauvais export.",
    content: "<h2>Les résolutions idéales</h2><p>Pour YouTube : exportez en 4K ou au minimum en 1080p, à 24 ou 30 images par seconde. Pour Instagram et TikTok : exportez en 1080p (la 4K est souvent compressée de manière agressive par ces réseaux) à 30 ou 60 images par seconde.</p><h3>Le Bitrate (Débit binaire)</h3><p>Le bitrate est crucial pour la qualité. Si votre application le permet, exportez avec un débit élevé (High Bitrate). Un mauvais débit donnera une vidéo pixelisée lors des mouvements rapides.</p>",
    thumbnail: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  },
  {
    title: "L'Équipement Essentiel du Vidéaste Mobile en 2026",
    slug: "equipement-essentiel-videaste-mobile",
    summary: "Quels accessoires acheter pour transformer votre téléphone en caméra de cinéma.",
    content: "<h2>Les Indispensables</h2><p>Votre priorité devrait être : 1. Un bon microphone (sans fil ou directionnel). 2. Un trépied robuste. 3. Une source de lumière LED. Avec ces trois éléments, vous dépassez 90% des créateurs.</p><h3>Pour aller plus loin</h3><p>Ensuite, envisagez d'acheter des filtres ND (qui agissent comme des lunettes de soleil pour votre lentille) pour filmer en extérieur tout en gardant un flou de mouvement naturel, ou des objectifs additionnels (macro ou anamorphique) pour des rendus créatifs.</p>",
    thumbnail: "https://images.unsplash.com/photo-1520390119829-051ebedcec06?auto=format&fit=crop&q=80&w=800",
    isPublished: true
  }
];

async function main() {
  console.log("Vérification d'un utilisateur existant...");
  let user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!user) {
    console.log("Aucun admin trouvé. Création d'un auteur de blog temporaire...");
    user = await prisma.user.create({
      data: {
        email: "blog-author-" + Date.now() + "@myacademy.com",
        name: "Auteur IA",
        role: "ADMIN"
      }
    });
  }

  console.log(`Utilisation de l'auteur ID: ${user.id}`);
  console.log("Insertion des 20 articles de blog...");

  let count = 0;
  for (const post of blogPosts) {
    // Upsert pour éviter les duplicatas en cas d'exécution multiple
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        content: post.content,
        thumbnail: post.thumbnail,
        isPublished: post.isPublished,
      },
      create: {
        ...post,
        authorId: user.id
      }
    });
    count++;
  }

  console.log(`✅ ${count} articles de blog ont été créés/mis à jour avec succès !`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
