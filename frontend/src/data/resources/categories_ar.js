import React from 'react'
import { Monitor, Layout, ShoppingCart, TrendingUp, Share2, Video, Image as ImageIcon, PenTool, Sparkles } from 'lucide-react'

export const resourceCategories = [
  {
    id: "web-dev",
    shortTitle: "تطوير الويب",
    title: "تطوير الويب (الذكاء الاصطناعي والبرمجة)",
    description: "أفضل أدوات الذكاء الاصطناعي لكتابة الأكواد بشكل أسرع وتصميم تطبيقات ويب معقدة.",
    icon: <Monitor size={20} />,
    color: "text-blue-500",
    tools: [
      { name: "ChatGPT", url: "https:chat.openai.com", desc: "الكلاسيكي المطلق لإنشاء الأكواد، وإصلاح الأخطاء، وشرح الخوارزميات.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Cursor", url: "https:cursor.sh", desc: "محرر الأكواد (المدعوم بـ VS Code) بالذكاء الاصطناعي، الأقوى على الإطلاق في السوق.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "v0 من Vercel", url: "https:v0.dev", desc: "قم بإنشاء واجهات React/Tailwind رائعة عن طريق كتابة وصف بسيط.", badges: ["أرصدة مجانية", "بدون علامة مائية"] },
      { name: "GitHub Copilot", url: "https:github.com/features/copilot", desc: "مساعد الذكاء الاصطناعي من GitHub المدمج مباشرة في محرر الأكواد الخاص بك.", badges: ["تجربة مجانية", "مدفوع"] },
      { name: "Codeium", url: "https:codeium.com", desc: "بديل قوي ومجاني تماماً لـ GitHub Copilot للمستقلين.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Blackbox AI", url: "https:www.blackbox.ai", desc: "ذكاء اصطناعي مصمم خصيصاً لمطوري الويب.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Replit", url: "https:replit.com", desc: "قم بكتابة وتجميع واستضافة مشاريعك مباشرة في المتصفح باستخدام Replit AI.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Supabase", url: "https:supabase.com", desc: "البديل مفتوح المصدر لـ Firebase لإدارة قواعد البيانات الخاصة بك بسهولة.", badges: ["مجاني جزئياً", "مفتوح المصدر"] },
      { name: "Mintlify", url: "https:mintlify.com", desc: "إنشاء وثائق (Documentation) تلقائية وفورية لقاعدة الأكواد الخاصة بك.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Tabnine", url: "https:www.tabnine.com", desc: "إكمال تلقائي للأكواد بالذكاء الاصطناعي سريع للغاية ويحترم الخصوصية.", badges: ["مجاني جزئياً", "بدون علامة مائية"] }
    ]
  },
  {
    id: "no-code",
    shortTitle: "بدون كود",
    title: "إنشاء المواقع بدون كود (No-Code)",
    description: "قم بإنشاء مواقع ويب وتطبيقات كاملة دون كتابة سطر واحد من التعليمات البرمجية.",
    icon: <Layout size={20} />,
    color: "text-indigo-500",
    tools: [
      { name: "Webflow", url: "https:webflow.com", desc: "الأداة المطلقة (بدون كود) لإنشاء مواقع ويب احترافية، متحركة، وسريعة جداً.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Framer", url: "https:www.framer.com", desc: "قم بإنشاء مواقع كاملة بطلب واحد من الذكاء الاصطناعي، مثالي لمعارض الأعمال (Portfolios).", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "WordPress.org", url: "https:wordpress.org", desc: "نظام إدارة المحتوى الذي يشغل 40% من الويب عالمياً. مجاني، ولكنه يتطلب استضافة.", badges: ["مجاني 100%", "مفتوح المصدر"] },
      { name: "Bubble", url: "https:bubble.io", desc: "البرنامج (بدون كود) الأقوى لإنشاء تطبيقات الويب المعقدة.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Make", url: "https:www.make.com", desc: "البديل الأكثر وضوحاً وأرخص من Zapier لأتمتة العمليات.", badges: ["مجاني جزئياً", "محدود"] },
      { name: "Zapier", url: "https:zapier.com", desc: "الرائد في ربط تطبيقاتك ببعضها البعض دون الحاجة للبرمجة.", badges: ["مجاني جزئياً", "محدود"] },
      { name: "Softr", url: "https:www.softr.io", desc: "قم بإنشاء بوابات عملاء أو مواقع ويب كاملة من قاعدة بيانات Airtable.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Airtable", url: "https:airtable.com", desc: "قاعدة بيانات هجينة بين Excel وقاعدة بيانات قوية، مثالية للأدوات بدون كود.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Wix", url: "https:fr.wix.com", desc: "أبسط أداة لإنشاء مواقع الويب للمبتدئين تماماً.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Notion (Sites)", url: "https:www.notion.so", desc: "حوّل أي صفحة في Notion إلى موقع ويب عام بنقرة واحدة.", badges: ["مجاني جزئياً", "بدون علامة مائية"] }
    ]
  },
  {
    id: "ecommerce",
    shortTitle: "التجارة الإلكترونية",
    title: "التجارة الإلكترونية والدروبشيبينغ",
    description: "أفضل المنصات لإطلاق متجرك عبر الإنترنت وإدارة مبيعاتك.",
    icon: <ShoppingCart size={20} />,
    color: "text-yellow-500",
    tools: [
      { name: "Shopify", url: "https:www.shopify.com", desc: "عملاق التجارة الإلكترونية العالمي. سهل الاستخدام لإطلاق متجر بسرعة.", badges: ["تجربة مجانية", "مدفوع"] },
      { name: "WooCommerce", url: "https:woocommerce.com", desc: "إضافة التجارة الإلكترونية لـ WordPress. قوي ولكنه يحتاج لخبرة تقنية.", badges: ["مجاني 100%", "مفتوح المصدر"] },
      { name: "Stripe", url: "https:stripe.com", desc: "البنية التحتية الأولى للدفع في العالم لقبول البطاقات المصرفية.", badges: ["مجاني 100%", "يأخذ عمولة"] },
      { name: "PayPal", url: "https:www.paypal.com", desc: "لا غنى عنه لتقديم بديل دفع آمن لعملائك.", badges: ["مجاني 100%", "يأخذ عمولة"] },
      { name: "Minea", url: "https:minea.com", desc: "أفضل أداة بحث عن المنتجات الرابحة للدروبشيبينغ (Spy Ads).", badges: ["تجربة مجانية", "مدفوع"] },
      { name: "CJ Dropshipping", url: "https:cjdropshipping.com", desc: "مورد سريع وموثوق، بديل ممتاز لـ AliExpress.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Zendrop", url: "https:zendrop.com", desc: "تطبيق دروبشيبينغ آلي، مواعيد تسليم جيدة جداً للولايات المتحدة.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "AutoDS", url: "https:autods.com", desc: "قم بأتمتة متجرك: استيراد المنتجات، الطلبات، التتبع.", badges: ["تجربة مجانية", "مدفوع"] },
      { name: "Printify", url: "https:printify.com", desc: "الطباعة عند الطلب (POD). بيع قمصانك بدون مخزون.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Printful", url: "https:www.printful.com", desc: "البديل المتميز لـ Printify، بجودة أعلى.", badges: ["مجاني 100%", "بدون علامة مائية"] }
    ]
  },
  {
    id: "marketing",
    shortTitle: "التسويق و SEO",
    title: "التسويق الرقمي و SEO",
    description: "كل ما تحتاجه لتحليل، أرشفة، وتعزيز مبيعاتك.",
    icon: <TrendingUp size={20} />,
    color: "text-emerald-500",
    tools: [
      { name: "Google Analytics 4", url: "https:analytics.google.com", desc: "أداة جوجل المجانية لتحليل جميع حركات المرور (الترافيك) على موقع الويب الخاص بك بالتفصيل.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Google Search Console", url: "https:search.google.com", desc: "لا غنى عنه لتتبع الترتيب العضوي (SEO) الخاص بك على جوجل.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Ubersuggest", url: "https:neilpatel.com/ubersuggest", desc: "ابحث عن أفضل الكلمات المفتاحية وحلل منافسيك ببضع نقرات.", badges: ["مجاني جزئياً", "محدود"] },
      { name: "AnswerThePublic", url: "https:answerthepublic.com", desc: "اكتشف بالضبط ما هي الأسئلة التي يطرحها الناس على جوجل.", badges: ["مجاني جزئياً", "محدود"] },
      { name: "Systeme.io", url: "https:systeme.io", desc: "أفضل بديل لإنشاء مسارات مبيعات (Sales Funnels) كاملة مجاناً.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Brevo", url: "https:www.brevo.com", desc: "حل ممتاز للتسويق عبر البريد الإلكتروني (مجاني حتى 300 بريد/يوم).", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Mailchimp", url: "https:mailchimp.com", desc: "أداة البريد الإلكتروني الكلاسيكية (مجانية حتى 500 جهة اتصال).", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Meta Business Suite", url: "https:business.facebook.com", desc: "لوحة التحكم الرسمية لإدارة وتحليل إعلانات Meta الخاصة بك.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Hotjar", url: "https:www.hotjar.com", desc: "سجل شاشة زوار موقعك لترى أين ينقرون (الخرائط الحرارية).", badges: ["مجاني جزئياً", "محدود"] },
      { name: "HubSpot CRM", url: "https:www.hubspot.fr", desc: "نظام إدارة علاقات عملاء (CRM) كامل ومجاني 100% لإدارة جميع عملائك والمحتملين بشكل احترافي.", badges: ["مجاني 100%", "بدون علامة مائية"] }
    ]
  },
  {
    id: "social-media",
    shortTitle: "السوشيال ميديا",
    title: "المحتوى ووسائل التواصل الاجتماعي",
    description: "الأدوات المفضلة للمؤثرين ومديري المجتمعات (Community Managers).",
    icon: <Share2 size={20} />,
    color: "text-rose-500",
    tools: [
      { name: "Canva", url: "https:www.canva.com", desc: "قم بإنشاء تصميمات مرئية، وصور مصغرة لليوتيوب، وكاروسيلات بسهولة شديدة.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Metricool", url: "https:metricool.com", desc: "قم بتحليل إحصائياتك المتقدمة وجدولة منشوراتك على جميع الشبكات.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Buffer", url: "https:buffer.com", desc: "أداة بسيطة ونظيفة لجدولة نشر محتواك.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Linktree", url: "https:linktr.ee", desc: "قم بتجميع جميع روابطك المهمة في رابط واحد للسيرة الذاتية (Bio) الخاصة بك.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "ManyChat", url: "https:manychat.com", desc: "سر صناع المحتوى: يقوم بأتمتة رسائل إنستغرام المباشرة (مثل 'اكتب INFO').", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Snapseed", url: "https:snapseed.online", desc: "تطبيق جوجل لتعديل صورك على الهاتف كالمحترفين.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "CapCut (Mobile)", url: "https:www.capcut.com", desc: "التطبيق الأساسي لمونتاج فيديوهات تيك توك، ريلز، والفيديوهات سريعة الانتشار.", badges: ["مجاني جزئياً", "يمكن إزالة العلامة المائية"] },
      { name: "TweetDeck (X Pro)", url: "https:tweetdeck.twitter.com", desc: "قم بإدارة حسابات متعددة على تويتر (X) بشكل احترافي.", badges: ["مدفوع", "يتطلب X Premium"] },
      { name: "Tweet Hunter", url: "https:tweethunter.io", desc: "اعثر على الإلهام، واكتب، وفجّر مشاهداتك على تويتر ولينكد إن.", badges: ["تجربة مجانية", "مدفوع"] },
      { name: "Taplio", url: "https:taplio.com", desc: "الأخ الأصغر لـ Tweet Hunter، ولكنه مصمم خصيصاً للسيطرة على لينكد إن.", badges: ["تجربة مجانية", "مدفوع"] }
    ]
  },
  {
    id: "video-ai",
    shortTitle: "فيديو بالذكاء الاصطناعي",
    title: "المونتاج والفيديو بالذكاء الاصطناعي",
    description: "قم بتحرير مقاطع الفيديو الخاصة بك بسرعة 10 أضعاف أو أنشئ فيديوهات من نصوص.",
    icon: <Video size={20} />,
    color: "text-green-500",
    tools: [
      { name: "DaVinci Resolve", url: "https:www.blackmagicdesign.com/products/davinciresolve", desc: "برنامج مونتاج هوليوودي، يُستخدم في الأفلام الكبيرة، مجاني 100%.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Opus Clip", url: "https:www.opus.pro", desc: "يحول مقاطع فيديو يوتيوب الطويلة أو البودكاست إلى العشرات من الفيديوهات القصيرة (Shorts).", badges: ["أرصدة مجانية", "بعلامة مائية"] },
      { name: "HeyGen", url: "https:www.heygen.com", desc: "أنشئ فيديوهات عن طريق كتابة نص مع شخصية افتراضية (Avatar) بالذكاء الاصطناعي واقعية جداً تتحدث نيابة عنك.", badges: ["تجربة مجانية", "بعلامة مائية"] },
      { name: "Runway ML", url: "https:runwayml.com", desc: "سحر الفيديو. حوّل صورة أو نصاً إلى فيديو حقيقي.", badges: ["أرصدة مجانية", "بعلامة مائية"] },
      { name: "Synthesia", url: "https:www.synthesia.io", desc: "الرائد في الصور الرمزية (Avatars) بالذكاء الاصطناعي لإنشاء مقاطع فيديو للتدريب المؤسسي.", badges: ["مدفوع", "تجربة مجانية"] },
      { name: "InVideo IA", url: "https:invideo.io", desc: "أنشئ مقاطع فيديو يوتيوب كاملة (صوت، صور، ومونتاج) عبر أمر نصي (Prompt).", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Veed.io", url: "https:www.veed.io", desc: "محرر فيديو قوي عبر الإنترنت، معروف عالمياً بترجماته المتحركة التلقائية.", badges: ["مجاني جزئياً", "بعلامة مائية"] },
      { name: "Pika Labs", url: "https:pika.art", desc: "أنشئ مقاطع فيديو وحرّك الصور مجاناً عبر ديسكورد (Discord) أو الويب.", badges: ["أرصدة مجانية", "بعلامة مائية"] },
      { name: "Topaz Video AI", url: "https:www.topazlabs.com", desc: "يستخدم الذكاء الاصطناعي لزيادة الجودة، الحدة، والسلاسة لمقاطع الفيديو القديمة.", badges: ["مدفوع", "بعلامة مائية"] }
    ]
  },
  {
    id: "images",
    shortTitle: "منشئات الصور",
    title: "منشئات الصور بالذكاء الاصطناعي",
    description: "الذكاء الاصطناعي لإنشاء رسومات توضيحية مذهلة.",
    icon: <ImageIcon size={20} />,
    color: "text-pink-500",
    tools: [
      { name: "Midjourney", url: "https:www.midjourney.com", desc: "الزعيم بلا منازع. نتائج فنية وواقعية مذهلة.", badges: ["مدفوع", "يتطلب اشتراك"] },
      { name: "Leonardo.ai", url: "https:leonardo.ai", desc: "أفضل بديل 'مجاني جزئياً' لـ Midjourney، مع أرصدة مجانية يومية.", badges: ["أرصدة مجانية", "بدون علامة مائية"] },
      { name: "DALL-E 3", url: "https:chat.openai.com", desc: "الذكاء الاصطناعي من OpenAI. يفهم ويحترم طلباتك المعقدة بشكل مثالي.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Ideogram", url: "https:ideogram.ai", desc: "الذكاء الاصطناعي الوحيد القادر على إنشاء نص مقروء تماماً على صورك.", badges: ["أرصدة مجانية", "بدون علامة مائية"] },
      { name: "Stable Diffusion", url: "https:stability.ai", desc: "ذكاء اصطناعي مفتوح المصدر قوي جداً، قابل للتثبيت محلياً (مجاناً) لتجنب الرقابة.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Playground AI", url: "https:playgroundai.com", desc: "واجهة ويب بسيطة لإنشاء الصور وتعديلها.", badges: ["أرصدة مجانية", "بدون علامة مائية"] },
      { name: "Lexica", url: "https:lexica.art", desc: "محرك بحث لاستلهام الأفكار من الصور المُنشأة واستخراج الأوامر (Prompts) الخاصة بها.", badges: ["أرصدة مجانية", "بدون علامة مائية"] },
      { name: "Freepik AI", url: "https:www.freepik.com/ai/image-generator", desc: "المُنشئ فائق السرعة من Freepik، يُستخدم بكثرة للعناصر الرسومية.", badges: ["أرصدة مجانية", "بدون علامة مائية"] }
    ]
  },
  {
    id: "copywriting",
    shortTitle: "كتابة الإعلانات",
    title: "كتابة الإعلانات والمحتوى (Copywriting)",
    description: "اكتب نصوصاً مقنعة، ورسائل بريد إلكتروني، أو صحح أخطاءك باستخدام الذكاء الاصطناعي.",
    icon: <PenTool size={20} />,
    color: "text-orange-500",
    tools: [
      { name: "Jasper", url: "https:www.jasper.ai", desc: "أداة الذكاء الاصطناعي التاريخية المتخصصة لكتاب الإعلانات وتسويق المحتوى.", badges: ["مدفوع", "تجربة مجانية"] },
      { name: "Copy.ai", url: "https:www.copy.ai", desc: "مثالي لكتابة أوصاف المنتجات، منشورات لينكد إن، ورسائل البريد الإلكتروني.", badges: ["مجاني جزئياً", "محدود"] },
      { name: "Writesonic", url: "https:writesonic.com", desc: "منشئ مقالات مدونة مع الأخذ في الاعتبار تحسين محركات البحث (SEO).", badges: ["مجاني جزئياً", "محدود"] },
      { name: "Rytr", url: "https:rytr.me", desc: "بديل أرخص وأبسط لـ Jasper لإنشاء نصوص قصيرة.", badges: ["مجاني جزئياً", "محدود"] },
      { name: "Deepl", url: "https:www.deepl.com", desc: "أفضل مترجم في العالم، طبيعي أكثر بكثير من ترجمة جوجل.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "LanguageTool", url: "https:languagetool.org", desc: "مصحح إملائي ونحوي متعدد اللغات مجاني.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "MerciApp", url: "https:www.merci-app.com", desc: "المصحح الإملائي الفرنسي من الجيل التالي.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Antidote", url: "https:www.antidote.info", desc: "برنامج التصحيح الاحترافي المطلق باللغة الفرنسية.", badges: ["مدفوع", "شراء مرة واحدة"] },
      { name: "QuillBot", url: "https:quillbot.com", desc: "يعيد صياغة ويحسن أي نص بشكل طبيعي ومجاني.", badges: ["مجاني جزئياً", "محدود"] }
    ]
  },
  {
    id: "business",
    shortTitle: "الأعمال والـ AI",
    title: "الأعمال والإنتاجية",
    description: "مساعدون افتراضيون وبرامج أساسية لتوفير ساعات من وقتك كل يوم.",
    icon: <Sparkles size={20} />,
    color: "text-amber-500",
    tools: [
      { name: "Notion", url: "https:www.notion.so", desc: "أداة التنظيم المطلقة. حوّل حياتك إلى نظام كامل.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Claude 3 (Anthropic)", url: "https:claude.ai", desc: "بديل ممتاز لـ ChatGPT، معروف بكتابة إنسانية ودقيقة للغاية.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Perplexity AI", url: "https:www.perplexity.ai", desc: "محرك بحث الذكاء الاصطناعي. يقرأ الويب ويلخص مع مصادر حقيقية.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Gamma App", url: "https:gamma.app", desc: "يقوم الذكاء الاصطناعي بإنشاء عرض تقديمي (Pitch Deck) رائع في 30 ثانية.", badges: ["أرصدة مجانية", "بعلامة مائية"] },
      { name: "Tome", url: "https:tome.app", desc: "أداة سرد قصصي مرئي تفاعلية، مثالية لشرح مشروع.", badges: ["أرصدة مجانية", "بعلامة مائية"] },
      { name: "Fathom", url: "https:fathom.video", desc: "ينضم إلى اجتماعات Zoom/Google Meet الخاصة بك، ويدون كل شيء، ويرسل لك الملخص.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Chatbase", url: "https:www.chatbase.co", desc: "ارفع ملفات الـ PDF الخاصة بك، واحصل على روبوت محادثة (Chatbot) بالذكاء الاصطناعي يعرف كل شيء عن عملك.", badges: ["أرصدة مجانية", "بعلامة مائية"] },
      { name: "Trello", url: "https:trello.com", desc: "إدارة كانبان (Kanban) بسيطة جداً لمهامك الشخصية أو مهام فريقك.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Slack", url: "https:slack.com", desc: "أداة المراسلة للتواصل الصحيح داخل الشركة.", badges: ["مجاني جزئياً", "محدود"] }
    ]
  },
  {
    id: "free-ai",
    shortTitle: "AI مجاني 100%",
    title: "أدوات الذكاء الاصطناعي مجانية 100%",
    description: "مجموعة حصرية من أدوات الذكاء الاصطناعي المجانية بالكامل أو المفتوحة المصدر.",
    icon: <Sparkles size={20} />,
    color: "text-green-500",
    tools: [
      { name: "HuggingFace", url: "https://huggingface.co/chat/", desc: "المكافئ لـ ChatGPT، مجاني تماماً مع أفضل النماذج المفتوحة المصدر (Llama 3, Mixtral).", badges: ["مجاني 100%", "مفتوح المصدر"] },
      { name: "Ollama", url: "https://ollama.com", desc: "قم بتشغيل الذكاء الاصطناعي (LLMs) مثل Llama 3 مباشرة على جهاز الكمبيوتر الخاص بك، بدون إنترنت ومجاناً.", badges: ["مجاني 100%", "مفتوح المصدر"] },
      { name: "Vectorizer.ai", url: "https://vectorizer.ai", desc: "يحول صورك المنقطة (PNG/JPG) على الفور إلى رسومات متجهة (SVG) بجودة لا نهائية.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "CapCut Desktop", url: "https://www.capcut.com", desc: "برنامج تحرير الفيديو الأكثر بديهية في السوق مع ميزات التسمية التوضيحية التلقائية بالذكاء الاصطناعي.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Obsidian", url: "https://obsidian.md", desc: "عقل ثانٍ محلي قوي لتخزين وربط ملاحظاتك الشخصية بتنسيق Markdown.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Perplexity AI", url: "https://www.perplexity.ai", desc: "أفضل محرك بحث بالذكاء الاصطناعي. مثالي لاستبدال جوجل. استخدام غير محدود مجاناً.", badges: ["مجاني جزئياً", "غير محدود"] },
      { name: "Claude (Sonnet 3.5)", url: "https://claude.ai", desc: "أفضل من ChatGPT للبرمجة والكتابة. النسخة المجانية سخية للغاية.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Microsoft Copilot", url: "https://copilot.microsoft.com", desc: "احصل على وصول إلى GPT-4 و DALL-E 3 مجاناً، برعاية مايكروسوفت.", badges: ["مجاني 100%", "بدون علامة مائية"] },
      { name: "Pinokio", url: "https://pinokio.computer", desc: "متصفح سحري يثبت أي ذكاء اصطناعي مفتوح المصدر بنقرة واحدة على جهاز الكمبيوتر الخاص بك.", badges: ["مجاني 100%", "مفتوح المصدر"] },
      { name: "Suno AI", url: "https://suno.com", desc: "أنشئ أغاني كاملة (كلمات وموسيقى) بجودة الاستوديو مجاناً كل يوم.", badges: ["أرصدة مجانية", "صوت"] },
      { name: "ElevenLabs", url: "https://elevenlabs.io", desc: "أفضل منشئ أصوات بالذكاء الاصطناعي في العالم. آلاف الأحرف المجانية كل شهر.", badges: ["مجاني جزئياً", "جودة عالية"] },
      { name: "LM Studio", url: "https://lmstudio.ai", desc: "اكتشف، نزل، وتحدث مع أي ذكاء اصطناعي محلي، بدون إنترنت بالكامل.", badges: ["مجاني 100%", "محلي"] },
      { name: "Krea AI", url: "https://www.krea.ai", desc: "إنشاء وتحسين جودة الصور في الوقت الفعلي. قوي جداً ومجاني.", badges: ["مجاني جزئياً", "بدون علامة مائية"] },
      { name: "Civitai", url: "https://civitai.com", desc: "أكبر منصة للعثور على نماذج إنشاء الصور بالذكاء الاصطناعي (Stable Diffusion).", badges: ["مجاني 100%", "مفتوح المصدر"] },
      { name: "Phind", url: "https://www.phind.com", desc: "محرك بحث بالذكاء الاصطناعي مصمم خصيصاً للمطورين. إجابات سريعة جداً.", badges: ["مجاني 100%", "بدون علامة مائية"] }
    ]
  }
];
