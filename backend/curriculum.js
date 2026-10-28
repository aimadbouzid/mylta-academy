// Programme détaillé de la formation présentielle (3 jours), en français, anglais et arabe.
// Modifiable dans l'admin ; le site affiche la langue choisie par le visiteur.
// Format d'une journée : { day, title, goal, items[] }.

const CURRICULUM = {
  fr: [
    {
      day: 'Jour 1',
      title: 'Filmer comme un pro — avec le téléphone que vous avez déjà',
      goal: 'À la fin de la journée, vous filmez des images que les gens prendront pour du matériel professionnel.',
      items: [
        "Les 7 réglages cachés de votre caméra que presque personne n'active (60 fps, verrouillage de la mise au point et de la lumière, grille, HDR, format)",
        'La lumière : transformer une fenêtre, une lampe de salon ou le soleil de Béjaïa en éclairage de studio',
        "Le son : l'erreur numéro 1 qui tue une vidéo, et comment avoir un son propre sans micro cher",
        'Le cadrage : la règle des tiers, la place du regard, la profondeur — pourquoi certaines images « respirent »',
        'Filmer stable et fluide sans stabilisateur : la façon de marcher, de tenir et de glisser son téléphone',
        "Les 8 plans qui racontent n'importe quelle histoire : large, serré, détail, par-dessus l'épaule, vue subjective…",
        "Le B-roll : le détail qui fait passer une vidéo d'amateur à professionnelle",
        'ATELIER : vous tournez votre première vraie séquence, corrigée en direct devant le groupe',
      ],
    },
    {
      day: 'Jour 2',
      title: "Monter vite et bien — et faire travailler l'intelligence artificielle pour vous",
      goal: "À la fin de la journée, vous montez une vidéo complète et l'IA vous fait gagner des heures.",
      items: [
        'CapCut de A à Z sur téléphone : interface, montage, gestes rapides',
        "Le montage au rythme : couper sur la musique et garder l'attention seconde par seconde",
        'Les sous-titres automatiques et leur style : la technique des vidéos qui retiennent les gens jusqu\'au bout',
        'Transitions propres, ralenti, accéléré, zoom progressif : les effets qui servent vraiment le montage',
        "L'étalonnage des couleurs : obtenir le « look » cinéma en trois réglages",
        "ChatGPT : écrire un script qui accroche dès les premières secondes, en français, en arabe ou en darija",
        'La voix off générée par IA, dans la langue de votre choix, sans vous enregistrer',
        'Créer images, visuels et miniatures avec une IA, même sans savoir dessiner',
        "Effacer un fond, un objet ou un bruit de fond : les outils qui font le travail en un geste",
        'ATELIER : montage complet de la séquence que vous avez tournée le jour 1',
      ],
    },
    {
      day: 'Jour 3',
      title: 'Publier, être vu, être payé',
      goal: 'Vous repartez avec vos vidéos terminées, votre méthode, et de quoi démarcher un premier client.',
      items: [
        'Le hook : les 3 premières secondes qui décident de tout, avec 10 modèles prêts à réutiliser',
        'TikTok, Instagram et YouTube Shorts : ce qui fait vraiment monter une vidéo, et ce qui la bloque',
        'Formats, titres, miniatures, hashtags : la liste à vérifier avant chaque publication',
        "Le contenu UGC : filmer un produit pour une marque, le format le plus demandé aujourd'hui",
        'Fixer vos prix et trouver vos premiers clients à Béjaïa : où chercher, quoi dire, quoi envoyer',
        'Construire votre portfolio en une seule journée, avec les vidéos de la formation',
        "Tenir le rythme : préparer plusieurs vidéos d'avance sans y passer ses journées",
        'ATELIER FINAL : projection des vidéos du groupe, corrections personnalisées et remise du certificat',
      ],
    },
  ],
  en: [
    {
      day: 'Day 1',
      title: 'Shoot like a pro — with the phone you already own',
      goal: "By the end of the day, you'll shoot footage people will mistake for professional gear.",
      items: [
        'The 7 hidden camera settings almost nobody turns on (60 fps, focus and exposure lock, grid, HDR, format)',
        'Light: turning a window, a living-room lamp or the Béjaïa sun into studio lighting',
        'Sound: the number one mistake that kills a video, and how to get clean audio without an expensive mic',
        'Framing: the rule of thirds, where the eyes sit, depth — why some shots simply breathe',
        'Steady, smooth footage without a gimbal: how to walk, hold and glide your phone',
        'The 8 shots that tell any story: wide, close-up, detail, over-the-shoulder, point of view and more',
        'B-roll: the detail that turns an amateur video into a professional one',
        'WORKSHOP: you shoot your first real sequence, reviewed live in front of the group',
      ],
    },
    {
      day: 'Day 2',
      title: 'Edit fast and well — and put artificial intelligence to work for you',
      goal: "By the end of the day, you'll have edited a full video, with AI saving you hours.",
      items: [
        'CapCut from A to Z on your phone: interface, editing, quick gestures',
        'Editing to the beat: cutting on the music and holding attention second by second',
        'Automatic subtitles and how to style them: the technique behind videos people watch to the end',
        'Clean transitions, slow motion, speed ramps, creeping zoom: the effects that actually serve the edit',
        'Colour grading: getting the cinema look in three settings',
        'ChatGPT: writing a script that hooks from the first seconds, in French, Arabic or Algerian darija',
        'AI voice-over in the language you choose, without recording yourself',
        'Creating images, graphics and thumbnails with AI, even if you cannot draw',
        'Removing a background, an object or background noise: the tools that do it in one move',
        'WORKSHOP: full edit of the sequence you shot on day 1',
      ],
    },
    {
      day: 'Day 3',
      title: 'Publish, get seen, get paid',
      goal: 'You leave with finished videos, your own method, and enough to approach a first client.',
      items: [
        'The hook: the first 3 seconds that decide everything, with 10 templates you can reuse',
        'TikTok, Instagram and YouTube Shorts: what truly pushes a video up, and what holds it back',
        'Formats, titles, thumbnails, hashtags: the checklist to run before every post',
        'UGC content: filming a product for a brand, the most requested format today',
        'Setting your prices and finding your first clients in Béjaïa: where to look, what to say, what to send',
        'Building your portfolio in a single day, using the videos from the training',
        'Keeping the pace: preparing several videos ahead without spending your life on it',
        'FINAL WORKSHOP: screening of the group videos, personal feedback and certificate ceremony',
      ],
    },
  ],
  ar: [
    {
      day: 'اليوم 1',
      title: 'صوّر باحترافية — بالهاتف الذي تملكه أصلًا',
      goal: 'في نهاية اليوم، تصوّر لقطات يظنّها الناس مصوّرة بمعدات احترافية.',
      items: [
        'إعدادات الكاميرا السبعة المخفية التي لا يفعّلها أحد تقريبًا (60 إطارًا، تثبيت التركيز والإضاءة، الشبكة، HDR، الصيغة)',
        'الإضاءة: تحويل نافذة أو مصباح البيت أو شمس بجاية إلى إضاءة استوديو',
        'الصوت: الخطأ الأول الذي يفسد أي فيديو، وكيف تحصل على صوت نظيف دون ميكروفون غالٍ',
        'التأطير: قاعدة الأثلاث، موضع النظر، العمق — لماذا تبدو بعض اللقطات مريحة للعين',
        'تصوير ثابت وسلس دون مثبّت: طريقة المشي، الإمساك بالهاتف وتحريكه',
        'اللقطات الثماني التي تروي أي قصة: واسعة، قريبة، تفصيلية، من فوق الكتف، بعين الشخص…',
        'لقطات الـ B-roll: التفصيل الذي ينقل الفيديو من هاوٍ إلى محترف',
        'ورشة: تصوّر أول مقطع حقيقي لك، مع تصحيح مباشر أمام المجموعة',
      ],
    },
    {
      day: 'اليوم 2',
      title: 'مونتاج سريع ومتقن — واجعل الذكاء الاصطناعي يعمل من أجلك',
      goal: 'في نهاية اليوم، تكون قد ركّبت فيديو كاملًا، والذكاء الاصطناعي يوفّر عليك ساعات.',
      items: [
        'CapCut من الألف إلى الياء على الهاتف: الواجهة، المونتاج، الحركات السريعة',
        'المونتاج على الإيقاع: القطع مع الموسيقى والحفاظ على الانتباه ثانية بثانية',
        'الترجمة التلقائية وتنسيقها: الطريقة التي تجعل المشاهد يكمل الفيديو إلى آخره',
        'انتقالات نظيفة، بطء، تسريع، تقريب تدريجي: المؤثرات التي تخدم المونتاج فعلًا',
        'تدرّج الألوان: الحصول على مظهر سينمائي بثلاثة إعدادات',
        'ChatGPT: كتابة نص يجذب من الثواني الأولى، بالفرنسية أو العربية أو الدارجة',
        'التعليق الصوتي بالذكاء الاصطناعي، باللغة التي تختارها، دون أن تسجّل صوتك',
        'إنشاء الصور والتصاميم والصور المصغّرة بالذكاء الاصطناعي، حتى إن كنت لا تجيد الرسم',
        'إزالة الخلفية أو شيء من الصورة أو ضجيج الخلفية: أدوات تنجز ذلك بضغطة',
        'ورشة: مونتاج كامل للمقطع الذي صوّرته في اليوم الأول',
      ],
    },
    {
      day: 'اليوم 3',
      title: 'انشر، كن مرئيًا، واحصل على المقابل',
      goal: 'تخرج بفيديوهات جاهزة، وبطريقة عمل خاصة بك، وبما يكفي للتواصل مع أول زبون.',
      items: [
        'الخطّاف: الثواني الثلاث الأولى التي تقرّر كل شيء، مع 10 نماذج جاهزة',
        'تيك توك وإنستغرام ويوتيوب شورتس: ما يرفع الفيديو فعلًا، وما يعيقه',
        'الصيغ والعناوين والصور المصغّرة والوسوم: القائمة التي تراجعها قبل كل نشر',
        'محتوى UGC: تصوير منتج لعلامة تجارية، وهو الأكثر طلبًا اليوم',
        'تحديد أسعارك وإيجاد أول زبائنك في بجاية: أين تبحث، وماذا تقول، وماذا ترسل',
        'بناء معرض أعمالك في يوم واحد، بالاعتماد على فيديوهات التكوين',
        'الاستمرار بوتيرة ثابتة: تحضير عدة فيديوهات مسبقًا دون أن يستهلك ذلك وقتك',
        'الورشة الختامية: عرض فيديوهات المجموعة، ملاحظات شخصية، وتسليم الشهادة',
      ],
    },
  ],
}

// Titres courts repris par la vidéo de présentation et le récapitulatif.
const PROGRAM_SHORT = [
  'Filmer comme un pro au smartphone',
  'Lumière, son et cadrage',
  'Montage CapCut au rythme',
  "Scripts, voix off et images par l'IA",
  'Hook et algorithmes : être vu',
  'UGC : trouver et facturer des clients',
]

module.exports = { CURRICULUM, PROGRAM_SHORT }
