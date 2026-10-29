// Programme détaillé de la formation présentielle (3 jours), en français, anglais et arabe.
// Modifiable dans l'admin ; le site affiche la langue choisie par le visiteur.
// Un point = { t: titre court, d: détail }. Le titre se lit d'un coup d'œil,
// le détail répond à « concrètement, on fait quoi ? ».

const CURRICULUM = {
  fr: [
    {
      day: 'Jour 1',
      title: 'Filmer comme un pro',
      goal: 'Le soir, vous repartez avec des images que l’on croirait tournées au matériel professionnel.',
      items: [
        { t: 'Les réglages cachés de votre caméra', d: '60 images/seconde, mise au point et lumière verrouillées, grille, HDR' },
        { t: 'La lumière', d: 'Transformer une fenêtre, une lampe de salon ou le soleil en éclairage de studio' },
        { t: 'Le son', d: "L'erreur qui tue une vidéo, et comment avoir un son net sans micro cher" },
        { t: 'Le cadrage', d: 'Règle des tiers, place du regard, profondeur : pourquoi une image « respire »' },
        { t: 'Filmer stable', d: 'Marcher, tenir et faire glisser son téléphone sans stabilisateur' },
        { t: 'Les 8 plans qui racontent', d: "Large, serré, détail, par-dessus l'épaule, vue subjective…" },
        { t: 'Le B-roll', d: "Le détail qui fait passer une vidéo d'amateur à professionnelle" },
        { t: 'Atelier', d: 'Vous tournez votre première séquence, corrigée en direct devant le groupe' },
      ],
    },
    {
      day: 'Jour 2',
      title: "Monter vite, et faire travailler l'IA",
      goal: "Le soir, vous avez monté une vidéo complète, et l'IA vous a fait gagner des heures.",
      items: [
        { t: 'CapCut de A à Z', d: 'Interface, montage et gestes rapides, directement sur téléphone' },
        { t: 'Le montage au rythme', d: "Couper sur la musique et garder l'attention seconde par seconde" },
        { t: 'Les sous-titres', d: 'Génération automatique et mise en forme qui retient jusqu’au bout' },
        { t: 'Transitions et vitesse', d: 'Ralenti, accéléré, zoom progressif : les effets qui servent le montage' },
        { t: "L'étalonnage des couleurs", d: 'Obtenir le « look » cinéma en trois réglages' },
        { t: 'ChatGPT', d: 'Écrire un script qui accroche, en français, en arabe ou en darija' },
        { t: 'La voix off par IA', d: 'Dans la langue de votre choix, sans enregistrer votre voix' },
        { t: 'Images et miniatures par IA', d: 'Créer vos visuels même sans savoir dessiner' },
        { t: 'Effacer en un geste', d: 'Un fond, un objet ou un bruit de fond' },
        { t: 'Atelier', d: 'Montage complet de la séquence tournée au jour 1' },
      ],
    },
    {
      day: 'Jour 3',
      title: 'Publier, être vu, être payé',
      goal: 'Vous repartez avec vos vidéos, votre méthode, et de quoi démarcher un premier client.',
      items: [
        { t: 'Le hook', d: 'Les 3 premières secondes qui décident de tout, avec 10 modèles réutilisables' },
        { t: 'Les algorithmes', d: 'TikTok, Instagram, YouTube Shorts : ce qui fait monter une vidéo' },
        { t: 'La check-list avant publication', d: 'Format, titre, miniature, hashtags' },
        { t: 'Le contenu UGC', d: "Filmer un produit pour une marque : le format le plus demandé aujourd'hui" },
        { t: 'Vos prix et vos clients', d: 'Où chercher à Béjaïa, quoi dire, quoi envoyer' },
        { t: 'Votre portfolio', d: 'Construit en une journée avec les vidéos de la formation' },
        { t: 'Tenir le rythme', d: "Préparer plusieurs vidéos d'avance sans y passer ses journées" },
        { t: 'Atelier final', d: 'Projection, corrections personnalisées et remise du certificat' },
      ],
    },
  ],
  en: [
    {
      day: 'Day 1',
      title: 'Shoot like a pro',
      goal: 'By the evening, you leave with footage people will take for professional gear.',
      items: [
        { t: 'Your camera’s hidden settings', d: '60 fps, locked focus and exposure, grid, HDR' },
        { t: 'Light', d: 'Turning a window, a living-room lamp or the sun into studio lighting' },
        { t: 'Sound', d: 'The mistake that kills a video, and how to get clean audio without a costly mic' },
        { t: 'Framing', d: 'Rule of thirds, where the eyes sit, depth: why a shot breathes' },
        { t: 'Steady shots', d: 'How to walk, hold and glide your phone without a gimbal' },
        { t: 'The 8 storytelling shots', d: 'Wide, close-up, detail, over-the-shoulder, point of view…' },
        { t: 'B-roll', d: 'The detail that turns an amateur video into a professional one' },
        { t: 'Workshop', d: 'You shoot your first sequence, reviewed live in front of the group' },
      ],
    },
    {
      day: 'Day 2',
      title: 'Edit fast, and put AI to work',
      goal: 'By the evening, you have edited a full video, with AI saving you hours.',
      items: [
        { t: 'CapCut from A to Z', d: 'Interface, editing and quick gestures, right on your phone' },
        { t: 'Editing to the beat', d: 'Cutting on the music and holding attention second by second' },
        { t: 'Subtitles', d: 'Automatic generation and styling that keeps people to the end' },
        { t: 'Transitions and speed', d: 'Slow motion, speed ramps, creeping zoom: effects that serve the edit' },
        { t: 'Colour grading', d: 'The cinema look in three settings' },
        { t: 'ChatGPT', d: 'Writing a script that hooks, in French, Arabic or Algerian darija' },
        { t: 'AI voice-over', d: 'In the language you choose, without recording your own voice' },
        { t: 'AI images and thumbnails', d: 'Creating your visuals even if you cannot draw' },
        { t: 'Erase in one move', d: 'A background, an object or background noise' },
        { t: 'Workshop', d: 'Full edit of the sequence you shot on day 1' },
      ],
    },
    {
      day: 'Day 3',
      title: 'Publish, get seen, get paid',
      goal: 'You leave with your videos, your method, and enough to approach a first client.',
      items: [
        { t: 'The hook', d: 'The first 3 seconds that decide everything, with 10 reusable templates' },
        { t: 'The algorithms', d: 'TikTok, Instagram, YouTube Shorts: what actually pushes a video up' },
        { t: 'The pre-publish checklist', d: 'Format, title, thumbnail, hashtags' },
        { t: 'UGC content', d: 'Filming a product for a brand: the most requested format today' },
        { t: 'Your prices and clients', d: 'Where to look in Béjaïa, what to say, what to send' },
        { t: 'Your portfolio', d: 'Built in a single day with the videos from the training' },
        { t: 'Keeping the pace', d: 'Preparing several videos ahead without spending your life on it' },
        { t: 'Final workshop', d: 'Screening, personal feedback and certificate ceremony' },
      ],
    },
  ],
  ar: [
    {
      day: 'اليوم 1',
      title: 'صوّر باحترافية',
      goal: 'في المساء، تخرج بلقطات يظنّها الناس مصوّرة بمعدات احترافية.',
      items: [
        { t: 'إعدادات الكاميرا المخفية', d: '60 إطارًا في الثانية، تثبيت التركيز والإضاءة، الشبكة، HDR' },
        { t: 'الإضاءة', d: 'تحويل نافذة أو مصباح البيت أو الشمس إلى إضاءة استوديو' },
        { t: 'الصوت', d: 'الخطأ الذي يفسد أي فيديو، وكيف تحصل على صوت نظيف دون ميكروفون غالٍ' },
        { t: 'التأطير', d: 'قاعدة الأثلاث، موضع النظر، العمق: لماذا تبدو بعض اللقطات مريحة' },
        { t: 'تصوير ثابت', d: 'كيف تمشي وتمسك هاتفك وتحرّكه دون مثبّت' },
        { t: 'اللقطات الثماني التي تروي قصة', d: 'واسعة، قريبة، تفصيلية، من فوق الكتف، بعين الشخص…' },
        { t: 'لقطات الـ B-roll', d: 'التفصيل الذي ينقل الفيديو من هاوٍ إلى محترف' },
        { t: 'ورشة', d: 'تصوّر أول مقطع لك، مع تصحيح مباشر أمام المجموعة' },
      ],
    },
    {
      day: 'اليوم 2',
      title: 'مونتاج سريع، والذكاء الاصطناعي يعمل معك',
      goal: 'في المساء، تكون قد ركّبت فيديو كاملًا، والذكاء الاصطناعي وفّر عليك ساعات.',
      items: [
        { t: 'CapCut من الألف إلى الياء', d: 'الواجهة والمونتاج والحركات السريعة، على الهاتف مباشرة' },
        { t: 'المونتاج على الإيقاع', d: 'القطع مع الموسيقى والحفاظ على الانتباه ثانية بثانية' },
        { t: 'الترجمة والنصوص', d: 'توليد تلقائي وتنسيق يجعل المشاهد يكمل إلى آخر الفيديو' },
        { t: 'الانتقالات والسرعة', d: 'بطء، تسريع، تقريب تدريجي: المؤثرات التي تخدم المونتاج' },
        { t: 'تدرّج الألوان', d: 'المظهر السينمائي بثلاثة إعدادات' },
        { t: 'ChatGPT', d: 'كتابة نص يجذب، بالفرنسية أو العربية أو الدارجة' },
        { t: 'التعليق الصوتي بالذكاء الاصطناعي', d: 'باللغة التي تختارها، دون تسجيل صوتك' },
        { t: 'الصور والصور المصغّرة بالذكاء الاصطناعي', d: 'إنشاء تصاميمك حتى إن كنت لا تجيد الرسم' },
        { t: 'المسح بضغطة واحدة', d: 'خلفية أو شيء في الصورة أو ضجيج' },
        { t: 'ورشة', d: 'مونتاج كامل للمقطع الذي صوّرته في اليوم الأول' },
      ],
    },
    {
      day: 'اليوم 3',
      title: 'انشر، كن مرئيًا، واحصل على المقابل',
      goal: 'تخرج بفيديوهاتك وبطريقة عمل خاصة بك، وبما يكفي للتواصل مع أول زبون.',
      items: [
        { t: 'الخطّاف', d: 'الثواني الثلاث الأولى التي تقرّر كل شيء، مع 10 نماذج جاهزة' },
        { t: 'الخوارزميات', d: 'تيك توك وإنستغرام ويوتيوب شورتس: ما يرفع الفيديو فعلًا' },
        { t: 'قائمة ما قبل النشر', d: 'الصيغة، العنوان، الصورة المصغّرة، الوسوم' },
        { t: 'محتوى UGC', d: 'تصوير منتج لعلامة تجارية: الأكثر طلبًا اليوم' },
        { t: 'أسعارك وزبائنك', d: 'أين تبحث في بجاية، وماذا تقول، وماذا ترسل' },
        { t: 'معرض أعمالك', d: 'تبنيه في يوم واحد بفيديوهات التكوين' },
        { t: 'الاستمرار بوتيرة ثابتة', d: 'تحضير عدة فيديوهات مسبقًا دون أن يستهلك وقتك' },
        { t: 'الورشة الختامية', d: 'عرض، ملاحظات شخصية، وتسليم الشهادة' },
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
