import React from 'react'
import { ShoppingCart, PenTool, Zap, TrendingUp, Rocket, Layout, Brain, Mic, Share2, Star, GraduationCap, Video, Youtube } from 'lucide-react'

export const masterclassCategories = [
  {
    id: "business",
    name: "الأعمال والمبيعات",
    title: "الأعمال والمبيعات ومسارات التحويل (Funnels)",
    desc: "التقنيات الأكثر قوة وربحية لتحويل الزوار العاديين إلى عملاء مخلصين.",
    icon: <ShoppingCart size={18} />,
    color: "text-orange-500",
    strategies: [
      {
        title: "عروض الـ 100 مليون دولار (Alex Hormozi)",
        icon: <ShoppingCart className="text-orange-500" size={24} />,
        color: "bg-orange-50 text-orange-600 border-orange-100",
        desc: "فن إنشاء عرض لا يقاوم.",
        points: [
          "🎁 أضف مكافآت لزيادة القيمة المتصورة.",
          "⚡️ قلل وقت الانتظار للوصول إلى النتيجة.",
          "🛡️ أزل المخاطرة (ضمان قوي أو 'استرداد الأموال')."
        ]
      },
      {
        title: "الخطاف، القصة، العرض (Russell Brunson)",
        icon: <PenTool className="text-emerald-500" size={24} />,
        color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        desc: "الإطار السري للبيع عبر الإنترنت.",
        points: [
          "🎣 الخطاف (HOOK): أوقف تمرير المستخدم (Scroll).",
          "📖 القصة (STORY): احكِ قصة حقيقية تبني التعاطف.",
          "🔥 العرض (OFFER): قدم عرضك السحري في النهاية."
        ]
      },
      {
        title: "كتابة الإعلانات الصارمة (Tugan Bara)",
        icon: <Zap className="text-red-600" size={24} />,
        color: "bg-red-50 text-red-700 border-red-100",
        desc: "اضرب في المكان الذي يؤلم.",
        points: [
          "🩸 تحدث عن الآلام العميقة، وليس المميزات.",
          "😈 جد عدواً مشتركاً لتهزمه (النظام، البنوك...).",
          "💊 قدم منتجك كحبة الإنقاذ الوحيدة."
        ]
      },
      {
        title: "نموذج AARRR (Growth Hacking)",
        icon: <TrendingUp className="text-orange-600" size={24} />,
        color: "bg-orange-50 text-orange-700 border-orange-100",
        desc: "مسار التحويل (Funnel) الخاص بالشركات الناشئة في وادي السيليكون.",
        points: [
          "🧲 الاستحواذ: جلب زيارات جماعية.",
          "✨ التنشيط: خلق تأثير 'واو' للزائر.",
          "💸 الإيرادات والاحتفاظ: اجعلهم يدفعون، واجعلهم يعودون."
        ]
      },
      {
        title: "الاختبار السريع (Yomi Denzel)",
        icon: <Rocket className="text-pink-500" size={24} />,
        color: "bg-pink-50 text-pink-600 border-pink-100",
        desc: "لا تضيع 3 أشهر على منتج غير مؤكد.",
        points: [
          "⏱️ أنشئ متجرك السريع في ساعتين كحد أقصى.",
          "💸 أنفق فقط 50 يورو على الإعلانات (TikTok أو Meta).",
          "🔪 إذا نجح: قم بالتوسع. إذا فشل: اقطع كل شيء دون ندم."
        ]
      },
      {
        title: "استراتيجية المحيط الأزرق",
        icon: <Layout className="text-sky-500" size={24} />,
        color: "bg-sky-50 text-sky-600 border-sky-100",
        desc: "أنشئ فئتك الخاصة.",
        points: [
          "🦈 اهرب من 'المحيطات الحمراء' (الأسواق المليئة بالمنافسين).",
          "🎨 ادمج سوقين لإنشاء تخصصك البكر.",
          "🏆 لا تحاول أن تكون 'الأفضل'، كن 'الوحيد'."
        ]
      }
    ]
  },
  {
    id: "mindset",
    name: "الإنتاجية والعقلية",
    title: "الإنتاجية والنماذج الذهنية",
    desc: "حسن عقلك، ووفر الوقت، واتخذ قرارات استراتيجية أفضل.",
    icon: <Brain size={18} />,
    color: "text-blue-500",
    strategies: [
      {
        title: "العقل الثاني (Ali Abdaal)",
        icon: <Brain className="text-blue-500" size={24} />,
        color: "bg-blue-50 text-blue-600 border-blue-100",
        desc: "عقلك مخصص للتفكير، وليس للتذكر.",
        points: [
          "📥 التقط كل ما تراه حرفياً (Notion, Obsidian).",
          "📂 نظم المعلومات بصرياً.",
          "🚀 أنشئ مشاريع من ملاحظاتك الخاصة."
        ]
      },
      {
        title: "قوة الرافعة (Naval Ravikant)",
        icon: <TrendingUp className="text-yellow-500" size={24} />,
        color: "bg-yellow-50 text-yellow-600 border-yellow-100",
        desc: "العمل الشاق لا يجعلك غنياً. قوة الرافعة (Leverage) تفعل ذلك.",
        points: [
          "🚫 المال والموظفون يتطلبون إذن الآخرين.",
          "💻 الكود (البرمجيات) والوسائط (الفيديو) لا حصر لها.",
          "😴 اصنع أشياء تعمل من أجلك أثناء نومك."
        ]
      },
      {
        title: "مبدأ باريتو 80/20 (Tim Ferriss)",
        icon: <Zap className="text-teal-500" size={24} />,
        color: "bg-teal-50 text-teal-600 border-teal-100",
        desc: "ركز على ما يهم.",
        points: [
          "🎯 80% من نتائجك تأتي من 20% من أفعالك.",
          "🗑️ احذف أو فوض 80% من المهام غير المفيدة.",
          "⭐ اعزل واتقن منطقة العبقرية الخاصة بك."
        ]
      },
      {
        title: "قاعدة الـ 1% (العادات الذرية - Atomic Habits)",
        icon: <TrendingUp className="text-fuchsia-500" size={24} />,
        color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
        desc: "النجاح هو تراكم للانتصارات الصغيرة.",
        points: [
          "📈 اهدف إلى تحسن بنسبة 1% فقط كل يوم.",
          "🔄 ركز على نظام جيد، وليس على هدف.",
          "🗓️ في نهاية العام، ستكون أفضل بـ 37 مرة."
        ]
      }
    ]
  },
  {
    id: "marketing",
    name: "التسويق والمحتوى",
    title: "التسويق والمحتوى والاحتفاظ",
    desc: "فن جذب الانتباه على الشبكات الاجتماعية وبناء جمهور مخلص.",
    icon: <Mic size={18} />,
    color: "text-purple-500",
    strategies: [
      {
        title: "قاعدة الـ 3 ثوانٍ (MrBeast)",
        icon: <Video className="text-red-500" size={24} />,
        color: "bg-red-50 text-red-600 border-red-100",
        desc: "الانتباه نادر. كل شيء يحدث في البداية.",
        points: [
          "🚨 إذا لم يجذب الانتباه في 3 ثوانٍ، فقد خسرت.",
          "🤯 يجب أن تعد مقدمتك بقيمة هائلة على الفور.",
          "✂️ اقطع كل فترات الصمت وادخل في صلب الموضوع."
        ]
      },
      {
        title: "سرد قصة الفشل (Oussama Ammar)",
        icon: <Mic className="text-purple-500" size={24} />,
        color: "bg-purple-50 text-purple-600 border-purple-100",
        desc: "يشتري الناس قصتك، وليس منتجك.",
        points: [
          "📉 لا تتحدث فقط عن نجاحاتك (يبدو ذلك متعجرفاً).",
          "💔 احكِ صراعاتك وشكوكك وإخفاقاتك الماضية.",
          "🫂 الضعف هو ما يوحد قبيلة حقيقية."
        ]
      },
      {
        title: "نظام الإنشاء (Justin Welsh)",
        icon: <Share2 className="text-blue-600" size={24} />,
        color: "bg-blue-50 text-blue-700 border-blue-100",
        desc: "قم بأتمتة محتواك دون إرهاق.",
        points: [
          "✍️ اكتب تنسيقاً طويلاً جداً مرة في الأسبوع (مثال: نشرة بريدية).",
          "✂️ قطعه إلى 6 منشورات قصيرة لشبكاتك الاجتماعية.",
          "♻️ حلل ما ينجح وبعه كمنتج رقمي."
        ]
      },
      {
        title: "ألف معجب حقيقي (Kevin Kelly)",
        icon: <Star className="text-indigo-500" size={24} />,
        color: "bg-indigo-50 text-indigo-600 border-indigo-100",
        desc: "لا حاجة لملايين المشتركين لكسب لقمة العيش.",
        points: [
          "❤️ جد 1000 معجب مستعدين لشراء كل ما تفعله.",
          "💰 إذا دفعوا 100€/سنة = تكسب 100,000€.",
          "🤝 فضل جمهوراً صغيراً ولكنه متفاعل جداً."
        ]
      },
      {
        title: "ابدأ بـ 'لماذا' (Simon Sinek)",
        icon: <GraduationCap className="text-cyan-500" size={24} />,
        color: "bg-cyan-50 text-cyan-600 border-cyan-100",
        desc: "إنهم لا يشترون ما تفعله، بل يشترون سبب قيامك به.",
        points: [
          "🌍 لماذا (WHY): اشرح مهمتك ومعتقداتك.",
          "⚙️ كيف (HOW): أظهر عمليتك الفريدة.",
          "📦 ماذا (WHAT): أخيراً، قدم منتجك النهائي."
        ]
      }
    ]
  },
  {
    id: "videos",
    name: "📺 فيديوهات مجانية",
    title: "فيديوهات يوتيوب وموارد",
    desc: "أفضل الدورات التدريبية المجانية (Masterclasses) على يوتيوب التي تقدم موارد في الوصف.",
    icon: <Youtube size={18} />,
    color: "text-red-500",
    videos: [
      {
        id: "v1",
        title: "30 أداة سرية للذكاء الاصطناعي (مجانية 100%)",
        channel: "Léo Duff / Tech",
        desc: "قائمة مذهلة بأدوات الذكاء الاصطناعي الأقل شهرة ولكنها شديدة القوة. تحقق من الوصف للحصول على ملف Notion المجاني الخاص به.",
        url: "https:www.youtube.com/results?search_query=leo+duff+outils+ia",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v2",
        title: "كيفية إنشاء تطبيق بدون كود في ساعة واحدة",
        channel: "Shubham Sharma",
        desc: "ملك الـ No-Code في فرنسا. يوضح كيفية استخدام FlutterFlow و Make، وغالباً ما يقدم 'مخططات الأتمتة' الخاصة به في الوصف.",
        url: "https:www.youtube.com/results?search_query=shubham+sharma+no+code",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v3",
        title: "إنشاء عمل تجاري بجمهور صفر",
        channel: "Antoine BM",
        desc: "كيفية إطلاق مشروع مربح مع عدم وجود من يستمع إليك في البداية. غالباً ما يقدم Antoine ملفات PDF أو خرائط ذهنية مجانية في وصفه.",
        url: "https:www.youtube.com/results?search_query=antoine+bm+0+audience",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v4",
        title: "كيف بعت شركة الـ SaaS الخاصة بي بـ 150 مليون دولار",
        channel: "Guillaume Moubeche",
        desc: "يشرح الرئيس التنفيذي لشركة Lemlist استراتيجيته للبريد الإلكتروني البارد (Cold Emailing). ملخص للقيمة الخام مع قوالب بريد إلكتروني معروضة غالباً في الوصف.",
        url: "https:www.youtube.com/results?search_query=guillaume+moubeche+lemlist",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v5",
        title: "طريقة العثور على عملاء (من 0 إلى 10 آلاف دولار/شهرياً)",
        channel: "Yomi Denzel / E-com",
        desc: "الاستراتيجيات الدقيقة لاكتساب العملاء. غالباً ما يقدم في سيرته الذاتية (Bio) تدريباً أساسياً مجانياً أو موارد للتجارة الإلكترونية.",
        url: "https:www.youtube.com/results?search_query=yomi+denzel+trouver+des+clients",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v6",
        title: "تعلم Webflow من الألف إلى الياء (دورة كاملة)",
        channel: "Théo Lion",
        desc: "أفضل مقدمة لإنشاء مواقع احترافية. تحقق من الوصف للحصول على روابط لقوالب Webflow المجانية.",
        url: "https:www.youtube.com/results?search_query=theo+lion+webflow",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v7",
        title: "تحليل نفسي: لماذا ينجح MrBeast؟",
        channel: "Marketing Mania",
        desc: "يفكك Stan Leloup علم النفس البشري واستراتيجيات الاحتفاظ. يتوفر غالباً مستند تحليل في الوصف.",
        url: "https:www.youtube.com/results?search_query=marketing+mania+mrbeast",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v8",
        title: "كيف تصبح وحشاً في الإنتاجية",
        channel: "Oussama Ammar",
        desc: "أفضل أساليبه للعمل بشكل جذري وبدون تشتيت. روابط مفيدة وتوصيات كتب عديدة أسفل الفيديو.",
        url: "https:www.youtube.com/results?search_query=oussama+ammar+productivite",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v9",
        title: "كيف تصبح مستقلاً مالياً بالذكاء الاصطناعي",
        channel: "Tugan Bara",
        desc: "تحليل صارم للسوق الحالي وكيفية استغلاله باستخدام كتابة الإعلانات (Copywriting). دروس (Masterclasses) مجانية دائماً عبر الروابط في الوصف.",
        url: "https:www.youtube.com/results?search_query=tugan+bara+copywriting+ia",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v10",
        title: "الدليل الشامل لإعلانات فيسبوك",
        channel: "Joseph Rousseau / J&J",
        desc: "دورة تدريبية معروضة حرفياً على يوتيوب بواسطة خبراء التجارة الإلكترونية الناطقين بالفرنسية. غالباً ما تكون قوالب الاستهداف الخاصة بهم مرتبطة خارجياً.",
        url: "https:www.youtube.com/results?search_query=facebook+ads+guide+complet",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v11",
        title: "كيفية تحقيق 10 آلاف دولار/شهرياً من قنوات يوتيوب بدون وجه (Cash Cow)",
        channel: "Oseille TV",
        desc: "درس كامل حول إنشاء قنوات يوتيوب آلية (دون إظهار وجهك). قائمة بالأدوات الموصى بها متوفرة في الوصف.",
        url: "https:www.youtube.com/results?search_query=oseille+tv+cash+cow",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v12",
        title: "عقلية المليونير (Mindset)",
        channel: "Alec Henry",
        desc: "تغلب على مخاوفك، وتغلب على المماطلة، وتجرأ على الانطلاق في ريادة الأعمال. غالباً ما يكون مصحوباً بعرض تدقيق مجاني في الوصف.",
        url: "https:www.youtube.com/results?search_query=alec+henry+mindset",
        icon: <Youtube className="text-red-500" size={32} />
      }
    ]
  }
];

export const labIdeasData = [
  {
    title: "كيف استبدل الذكاء الاصطناعي في 2026 حوالي 90% من عملي",
    type: "TikTok / Reel",
    niche: "تقنية / أعمال",
    difficulty: "متوسط",
    virality: 98,
    steps: [
      "قم بإنشاء خطاف صادم حول الذكاء الاصطناعي التوليدي في 2026",
      "أظهر سير عمل آلي بالكامل على الشاشة",
      "اختتم بدعوة لاتخاذ إجراء للاشتراك"
    ]
  },
  {
    title: "سر خوارزمية إنستغرام في 2027",
    type: "كاروسيل إنستغرام",
    niche: "تسويق",
    difficulty: "سهل",
    virality: 95,
    steps: [
      "الصفحة 1: عنوان جذاب برقم مجنون",
      "الصفحات 2-5: تفصيل مقياس التفاعل الجديد",
      "الصفحة 6: الحيلة لاختراق هذا المقياس اليوم"
    ]
  },
  {
    title: "3 مشاريع يمكنك إطلاقها في 2027 بـ 0 دولار",
    type: "TikTok",
    niche: "ريادة الأعمال",
    difficulty: "سهل",
    virality: 99,
    steps: [
      "خطاف بصري ديناميكي جداً (أسلوب سريع الخطى)",
      "اذكر 3 تخصصات غير مستكشفة بفضل التقنيات الجديدة",
      "اختتم بـ 'الأخير هو الأكثر ربحية'"
    ]
  },
  {
    title: "إعداد الواقع الافتراضي (VR) الخاص بي للعمل في 2026",
    type: "Reel Insta",
    niche: "أسلوب حياة / تقنية",
    difficulty: "صعب",
    virality: 92,
    steps: [
      "أظهر انتقالاً سلساً بين الواقع والواقع الافتراضي",
      "اشرح كيف يضاعف الواقع الافتراضي الإنتاجية",
      "اسأل في التعليقات: 'هل أنت مستعد للعمل هكذا؟'"
    ]
  },
  {
    title: "لماذا سيختفي المؤثرون في 2027",
    type: "فيديو قصير",
    niche: "تحليل / جدل",
    difficulty: "متوسط",
    virality: 97,
    steps: [
      "خطاف مثير للجدل حول نهاية التأثير البشري",
      "قدّم مؤثرين بالذكاء الاصطناعي واقعيين جداً",
      "ادعُ للنقاش في قسم التعليقات"
    ]
  },
  {
    title: "اختراق الدوبامين الخاص بك: طريقة 2026",
    type: "TikTok",
    niche: "تطوير ذاتي",
    difficulty: "سهل",
    virality: 94,
    steps: [
      "استخدم فلتراً مظلماً/جمالياً",
      "اشرح مفهوم 'صيام الدوبامين 2.0'",
      "قدم خطة عمل على مدى 3 أيام"
    ]
  },
  {
    title: "إنشاء علامة تجارية للملابس في ساعتين (نسخة 2027)",
    type: "Reel / TikTok",
    niche: "التجارة الإلكترونية",
    difficulty: "صعب",
    virality: 96,
    steps: [
      "قم بإنشاء التصميم باستخدام الذكاء الاصطناعي من نص إلى ثلاثي الأبعاد",
      "اربط مع مصنع آلي للطباعة عند الطلب (Print-on-demand)",
      "أطلق إعلانات تم إنشاؤها بواسطة الذكاء الاصطناعي"
    ]
  },
  {
    title: "الوظائف التي تدفع 10 آلاف دولار شهرياً في 2026",
    type: "كاروسيل إنستغرام",
    niche: "المالية / المهنة",
    difficulty: "سهل",
    virality: 89,
    steps: [
      "الشريحة 1: 'انسَ البرمجة، افعل هذا.'",
      "اذكر وظائف مثل 'مهندس أوامر (Prompt Architect)' و 'أخلاقيات الذكاء الاصطناعي'",
      "قدم تدريباً مجانياً في رابط البايو (Bio)"
    ]
  },
  {
    title: "أعيش في الميتافيرس لمدة 24 ساعة",
    type: "Mini-Vlog TikTok",
    niche: "ترفيه",
    difficulty: "صعب",
    virality: 98,
    steps: [
      "صوّر مقاطع من الحياة في الواقع المختلط",
      "أظهر تفاعلات مضحكة أو سخيفة",
      "راجع التجربة في النهاية"
    ]
  },
  {
    title: "أفضل أداة لعام 2026 والتي لا يعرفها أحد",
    type: "Reel Insta",
    niche: "أدوات / تقنية",
    difficulty: "سهل",
    virality: 93,
    steps: [
      "خطاف: 'لا تمرر الشاشة إذا كنت تريد توفير الوقت'",
      "عرض توضيحي سريع ومذهل للأداة على الشاشة",
      "اطلب التعليق بـ 'رابط' لتلقي الأداة في رسالة خاصة (DM)"
    ]
  }
];
