import React from 'react'
import { Monitor, Layout, ShoppingCart, TrendingUp, Share2, Video, Image as ImageIcon, PenTool, Sparkles } from 'lucide-react'

export const resourceCategories = [
  {
    id: "web-dev",
    shortTitle: "Web Dev",
    title: "Web Development (AI & Code)",
    description: "The best AI tools to write code faster and design complex web applications.",
    icon: <Monitor size={20} />,
    color: "text-blue-500",
    tools: [
      { name: "ChatGPT", url: "https:chat.openai.com", desc: "The absolute classic for generating code, debugging, and explaining algorithms.", badges: ["Freemium", "No Watermark"] },
      { name: "Cursor", url: "https:cursor.sh", desc: "The AI-powered code editor (based on VS Code), by far the most powerful on the market.", badges: ["Freemium", "No Watermark"] },
      { name: "v0 by Vercel", url: "https:v0.dev", desc: "Generate beautiful React/Tailwind interfaces by typing a simple description.", badges: ["Free Credits", "No Watermark"] },
      { name: "GitHub Copilot", url: "https:github.com/features/copilot", desc: "GitHub's AI assistant integrated directly into your editor.", badges: ["Free Trial", "Paid"] },
      { name: "Codeium", url: "https:codeium.com", desc: "A powerful and completely free alternative to GitHub Copilot for freelancers.", badges: ["100% Free", "No Watermark"] },
      { name: "Blackbox AI", url: "https:www.blackbox.ai", desc: "An artificial intelligence designed specifically for web developers.", badges: ["Freemium", "No Watermark"] },
      { name: "Replit", url: "https:replit.com", desc: "Code, compile, and host your projects directly in the browser with Replit AI.", badges: ["Freemium", "No Watermark"] },
      { name: "Supabase", url: "https:supabase.com", desc: "The Open Source alternative to Firebase to easily manage your databases.", badges: ["Freemium", "Open Source"] },
      { name: "Mintlify", url: "https:mintlify.com", desc: "Automatic and instant documentation generation for your codebase.", badges: ["Freemium", "No Watermark"] },
      { name: "Tabnine", url: "https:www.tabnine.com", desc: "Lightning-fast and privacy-friendly AI code autocompletion.", badges: ["Freemium", "No Watermark"] }
    ]
  },
  {
    id: "no-code",
    shortTitle: "No-Code",
    title: "No-Code & Website Creation",
    description: "Create complete websites and applications without writing a single line of code.",
    icon: <Layout size={20} />,
    color: "text-indigo-500",
    tools: [
      { name: "Webflow", url: "https:webflow.com", desc: "The ultimate no-code tool to create professional, animated, and ultra-fast websites.", badges: ["Freemium", "Watermarked"] },
      { name: "Framer", url: "https:www.framer.com", desc: "Generate complete sites with a single AI prompt, perfect for portfolios.", badges: ["Freemium", "Watermarked"] },
      { name: "WordPress.org", url: "https:wordpress.org", desc: "The CMS powering 40% of the web. Free, but requires hosting.", badges: ["100% Free", "Open Source"] },
      { name: "Bubble", url: "https:bubble.io", desc: "The most powerful no-code software for creating complex web applications.", badges: ["Freemium", "Watermarked"] },
      { name: "Make", url: "https:www.make.com", desc: "The more visual and cheaper alternative to Zapier to automate processes.", badges: ["Freemium", "Limited"] },
      { name: "Zapier", url: "https:zapier.com", desc: "The leader in connecting your applications without coding.", badges: ["Freemium", "Limited"] },
      { name: "Softr", url: "https:www.softr.io", desc: "Create client portals or full websites from an Airtable database.", badges: ["Freemium", "Watermarked"] },
      { name: "Airtable", url: "https:airtable.com", desc: "A hybrid database between Excel and a powerful DB, perfect for No-Code.", badges: ["Freemium", "No Watermark"] },
      { name: "Wix", url: "https:fr.wix.com", desc: "The simplest website creation tool for absolute beginners.", badges: ["Freemium", "Watermarked"] },
      { name: "Notion (Sites)", url: "https:www.notion.so", desc: "Turn any Notion page into a public website in one click.", badges: ["Freemium", "No Watermark"] }
    ]
  },
  {
    id: "ecommerce",
    shortTitle: "E-Commerce",
    title: "E-Commerce & Dropshipping",
    description: "The best platforms to launch your online store and manage your sales.",
    icon: <ShoppingCart size={20} />,
    color: "text-yellow-500",
    tools: [
      { name: "Shopify", url: "https:www.shopify.com", desc: "The global e-commerce giant. Easy to use to launch a store quickly.", badges: ["Free Trial", "Paid"] },
      { name: "WooCommerce", url: "https:woocommerce.com", desc: "The WordPress e-commerce plugin. Powerful but technical.", badges: ["100% Free", "Open Source"] },
      { name: "Stripe", url: "https:stripe.com", desc: "The #1 payment infrastructure in the world to accept credit cards.", badges: ["100% Free", "Commissions"] },
      { name: "PayPal", url: "https:www.paypal.com", desc: "Essential to offer a secure alternative payment method to your customers.", badges: ["100% Free", "Commissions"] },
      { name: "Minea", url: "https:minea.com", desc: "The best winning product research tool for dropshipping (Spy Ads).", badges: ["Free Trial", "Paid"] },
      { name: "CJ Dropshipping", url: "https:cjdropshipping.com", desc: "Fast and reliable supplier, excellent alternative to AliExpress.", badges: ["100% Free", "No Watermark"] },
      { name: "Zendrop", url: "https:zendrop.com", desc: "Automated dropshipping app, very good shipping times to the US.", badges: ["Freemium", "No Watermark"] },
      { name: "AutoDS", url: "https:autods.com", desc: "Automate your store: product imports, orders, tracking.", badges: ["Free Trial", "Paid"] },
      { name: "Printify", url: "https:printify.com", desc: "Print On Demand (POD). Sell your t-shirts without inventory.", badges: ["Freemium", "No Watermark"] },
      { name: "Printful", url: "https:www.printful.com", desc: "The Premium alternative to Printify, with superior quality.", badges: ["100% Free", "No Watermark"] }
    ]
  },
  {
    id: "marketing",
    shortTitle: "Marketing & SEO",
    title: "Digital Marketing & SEO",
    description: "Everything you need to analyze, rank, and boost your sales.",
    icon: <TrendingUp size={20} />,
    color: "text-emerald-500",
    tools: [
      { name: "Google Analytics 4", url: "https:analytics.google.com", desc: "Google's free tool to analyze all your website traffic in detail.", badges: ["100% Free", "No Watermark"] },
      { name: "Google Search Console", url: "https:search.google.com", desc: "Essential to track your organic ranking (SEO) on Google.", badges: ["100% Free", "No Watermark"] },
      { name: "Ubersuggest", url: "https:neilpatel.com/ubersuggest", desc: "Find the best keywords and analyze your competitors in a few clicks.", badges: ["Freemium", "Limited"] },
      { name: "AnswerThePublic", url: "https:answerthepublic.com", desc: "Discover exactly what questions people are asking on Google.", badges: ["Freemium", "Limited"] },
      { name: "Systeme.io", url: "https:systeme.io", desc: "The best alternative to create complete sales funnels for free.", badges: ["Freemium", "Watermarked"] },
      { name: "Brevo", url: "https:www.brevo.com", desc: "Excellent email marketing solution (free up to 300 emails/day).", badges: ["Freemium", "Watermarked"] },
      { name: "Mailchimp", url: "https:mailchimp.com", desc: "The classic emailing tool (freemium up to 500 contacts).", badges: ["Freemium", "Watermarked"] },
      { name: "Meta Business Suite", url: "https:business.facebook.com", desc: "The official dashboard to manage and analyze your Meta ads.", badges: ["100% Free", "No Watermark"] },
      { name: "Hotjar", url: "https:www.hotjar.com", desc: "Record your visitors' screens to see where they click (heatmaps).", badges: ["Freemium", "Limited"] },
      { name: "HubSpot CRM", url: "https:www.hubspot.fr", desc: "A complete 100% free CRM to manage all your clients and prospects professionally.", badges: ["100% Free", "No Watermark"] }
    ]
  },
  {
    id: "social-media",
    shortTitle: "Social Media",
    title: "Content & Social Media",
    description: "The favorite tools of influencers and community managers.",
    icon: <Share2 size={20} />,
    color: "text-rose-500",
    tools: [
      { name: "Canva", url: "https:www.canva.com", desc: "Create visuals, YouTube thumbnails, and carousels very easily.", badges: ["Freemium", "No Watermark"] },
      { name: "Metricool", url: "https:metricool.com", desc: "Analyze your advanced statistics and schedule your posts on all networks.", badges: ["Freemium", "No Watermark"] },
      { name: "Buffer", url: "https:buffer.com", desc: "Simple and clean tool to schedule the publication of your content.", badges: ["Freemium", "No Watermark"] },
      { name: "Linktree", url: "https:linktr.ee", desc: "Group all your important links into a single link for your bio.", badges: ["Freemium", "Watermarked"] },
      { name: "ManyChat", url: "https:manychat.com", desc: "The creators' secret: automates Instagram DMs (e.g. 'Comment INFO').", badges: ["Freemium", "No Watermark"] },
      { name: "Snapseed", url: "https:snapseed.online", desc: "Google's app to retouch your photos on your phone like a pro.", badges: ["100% Free", "No Watermark"] },
      { name: "CapCut (Mobile)", url: "https:www.capcut.com", desc: "The essential app to edit your TikToks, Reels, and viral videos.", badges: ["Freemium", "Watermark Removable"] },
      { name: "TweetDeck (X Pro)", url: "https:tweetdeck.twitter.com", desc: "Manage multiple Twitter (X) accounts professionally.", badges: ["Paid", "X Premium required"] },
      { name: "Tweet Hunter", url: "https:tweethunter.io", desc: "Find inspiration, write, and explode your views on Twitter and LinkedIn.", badges: ["Free Trial", "Paid"] },
      { name: "Taplio", url: "https:taplio.com", desc: "Tweet Hunter's little brother, but specifically designed to dominate LinkedIn.", badges: ["Free Trial", "Paid"] }
    ]
  },
  {
    id: "video-ai",
    shortTitle: "AI Video",
    title: "Editing & AI Video",
    description: "Edit your videos 10x faster or generate videos from text.",
    icon: <Video size={20} />,
    color: "text-green-500",
    tools: [
      { name: "DaVinci Resolve", url: "https:www.blackmagicdesign.com/products/davinciresolve", desc: "Hollywood editing software, used for major films, 100% free.", badges: ["100% Free", "No Watermark"] },
      { name: "Opus Clip", url: "https:www.opus.pro", desc: "Transforms your long YouTube videos or podcasts into dozens of Shorts.", badges: ["Free Credits", "Watermarked"] },
      { name: "HeyGen", url: "https:www.heygen.com", desc: "Create videos by typing text with an ultra-realistic AI avatar speaking for you.", badges: ["Free Trial", "Watermarked"] },
      { name: "Runway ML", url: "https:runwayml.com", desc: "The magic of video. Transform an image or text into a real video.", badges: ["Free Credits", "Watermarked"] },
      { name: "Synthesia", url: "https:www.synthesia.io", desc: "The leader in AI avatars for creating corporate training videos.", badges: ["Paid", "Free Trial"] },
      { name: "InVideo IA", url: "https:invideo.io", desc: "Generate entire YouTube videos (voice, images, and editing) via a prompt.", badges: ["Freemium", "Watermarked"] },
      { name: "Veed.io", url: "https:www.veed.io", desc: "Powerful online video editor, globally known for its automatic animated subtitles.", badges: ["Freemium", "Watermarked"] },
      { name: "Pika Labs", url: "https:pika.art", desc: "Generate videos and animate images for free via Discord or Web.", badges: ["Free Credits", "Watermarked"] },
      { name: "Topaz Video AI", url: "https:www.topazlabs.com", desc: "Uses AI to upscale quality, sharpness, and smoothness of old videos.", badges: ["Paid", "Watermarked"] }
    ]
  },
  {
    id: "images",
    shortTitle: "Image Generators",
    title: "AI Image Generators",
    description: "Artificial intelligences to create stunning illustrations.",
    icon: <ImageIcon size={20} />,
    color: "text-pink-500",
    tools: [
      { name: "Midjourney", url: "https:www.midjourney.com", desc: "The undisputed leader. Mind-blowing artistic and photorealistic results.", badges: ["Paid", "Subscription required"] },
      { name: "Leonardo.ai", url: "https:leonardo.ai", desc: "The best Freemium alternative to Midjourney, with daily free credits.", badges: ["Free Credits", "No Watermark"] },
      { name: "DALL-E 3", url: "https:chat.openai.com", desc: "OpenAI's AI. Understands and respects your complex requests perfectly.", badges: ["Freemium", "No Watermark"] },
      { name: "Ideogram", url: "https:ideogram.ai", desc: "The only AI capable of generating perfectly readable text on your images.", badges: ["Free Credits", "No Watermark"] },
      { name: "Stable Diffusion", url: "https:stability.ai", desc: "Very powerful open-source AI, installable locally (free) to avoid censorship.", badges: ["100% Free", "No Watermark"] },
      { name: "Playground AI", url: "https:playgroundai.com", desc: "A simple web interface to create and edit images.", badges: ["Free Credits", "No Watermark"] },
      { name: "Lexica", url: "https:lexica.art", desc: "Search engine to find inspiration from generated images and retrieve prompts.", badges: ["Free Credits", "No Watermark"] },
      { name: "Freepik AI", url: "https:www.freepik.com/ai/image-generator", desc: "Freepik's ultra-fast generator, widely used for graphic elements.", badges: ["Free Credits", "No Watermark"] }
    ]
  },
  {
    id: "copywriting",
    shortTitle: "Copywriting",
    title: "Copywriting & Writing",
    description: "Write persuasive texts, emails, or correct your mistakes with AI.",
    icon: <PenTool size={20} />,
    color: "text-orange-500",
    tools: [
      { name: "Jasper", url: "https:www.jasper.ai", desc: "The historical AI tool specialized for copywriters and content marketing.", badges: ["Paid", "Free Trial"] },
      { name: "Copy.ai", url: "https:www.copy.ai", desc: "Ideal for writing product descriptions, LinkedIn posts, and emails.", badges: ["Freemium", "Limited"] },
      { name: "Writesonic", url: "https:writesonic.com", desc: "Blog article generator that takes natural SEO into account.", badges: ["Freemium", "Limited"] },
      { name: "Rytr", url: "https:rytr.me", desc: "A cheaper and simpler alternative to Jasper to generate short text.", badges: ["Freemium", "Limited"] },
      { name: "Deepl", url: "https:www.deepl.com", desc: "The best translator in the world, infinitely more natural than Google Translate.", badges: ["100% Free", "No Watermark"] },
      { name: "LanguageTool", url: "https:languagetool.org", desc: "Free multi-language spelling and grammar checker.", badges: ["Freemium", "No Watermark"] },
      { name: "MerciApp", url: "https:www.merci-app.com", desc: "The next-generation French spell checker.", badges: ["Freemium", "No Watermark"] },
      { name: "Antidote", url: "https:www.antidote.info", desc: "The ultimate professional correction software in French.", badges: ["Paid", "One-time Purchase"] },
      { name: "QuillBot", url: "https:quillbot.com", desc: "Rewrites and improves any text naturally for free.", badges: ["Freemium", "Limited"] }
    ]
  },
  {
    id: "business",
    shortTitle: "Business & AI",
    title: "Business & Productivity",
    description: "Virtual assistants and essential software to save hours every day.",
    icon: <Sparkles size={20} />,
    color: "text-amber-500",
    tools: [
      { name: "Notion", url: "https:www.notion.so", desc: "The ultimate organization tool. Turn your life into a complete system.", badges: ["100% Free", "No Watermark"] },
      { name: "Claude 3 (Anthropic)", url: "https:claude.ai", desc: "Excellent alternative to ChatGPT, known for very human and nuanced writing.", badges: ["Freemium", "No Watermark"] },
      { name: "Perplexity AI", url: "https:www.perplexity.ai", desc: "The AI search engine. It reads the web and summarizes with real sources.", badges: ["Freemium", "No Watermark"] },
      { name: "Gamma App", url: "https:gamma.app", desc: "AI generates a beautiful Pitch Deck (PowerPoint presentation) in 30s.", badges: ["Free Credits", "Watermarked"] },
      { name: "Tome", url: "https:tome.app", desc: "Interactive visual storytelling tool, perfect for explaining a project.", badges: ["Free Credits", "Watermarked"] },
      { name: "Fathom", url: "https:fathom.video", desc: "Joins your Zoom/Google Meets, transcribes everything, and sends the summary.", badges: ["100% Free", "No Watermark"] },
      { name: "Chatbase", url: "https:www.chatbase.co", desc: "Upload your PDFs, and get an AI Chatbot that knows everything about your business.", badges: ["Free Credits", "Watermarked"] },
      { name: "Trello", url: "https:trello.com", desc: "Very simple Kanban management for your personal or team tasks.", badges: ["Freemium", "No Watermark"] },
      { name: "Slack", url: "https:slack.com", desc: "The messaging tool for proper corporate communication.", badges: ["Freemium", "Limited"] }
    ]
  },
  {
    id: "free-ai",
    shortTitle: "100% Free AI",
    title: "100% Free AI Tools",
    description: "An exclusive selection of totally free or Open Source artificial intelligences.",
    icon: <Sparkles size={20} />,
    color: "text-green-500",
    tools: [
      { name: "HuggingFace", url: "https://huggingface.co/chat/", desc: "The equivalent of ChatGPT, totally free with the best Open Source models (Llama 3, Mixtral).", badges: ["100% Free", "Open Source"] },
      { name: "Ollama", url: "https://ollama.com", desc: "Run AIs (LLMs) like Llama 3 directly on your computer, without internet and for free.", badges: ["100% Free", "Open Source"] },
      { name: "Vectorizer.ai", url: "https://vectorizer.ai", desc: "Instantly converts your pixelated images (PNG/JPG) into infinite quality vector graphics (SVG).", badges: ["100% Free", "No Watermark"] },
      { name: "CapCut Desktop", url: "https://www.capcut.com", desc: "The most intuitive video editing software on the market with auto-caption AI features.", badges: ["Freemium", "No Watermark"] },
      { name: "Obsidian", url: "https://obsidian.md", desc: "A powerful local Second Brain to store and link your personal notes in Markdown format.", badges: ["100% Free", "No Watermark"] },
      { name: "Perplexity AI", url: "https://www.perplexity.ai", desc: "The best AI search engine. Perfect to replace Google. Unlimited free usage.", badges: ["Freemium", "Unlimited"] },
      { name: "Claude (Sonnet 3.5)", url: "https://claude.ai", desc: "Better than ChatGPT to code and write. The free version is extremely generous.", badges: ["Freemium", "No Watermark"] },
      { name: "Microsoft Copilot", url: "https://copilot.microsoft.com", desc: "Access GPT-4 and DALL-E 3 for free, funded by Microsoft.", badges: ["100% Free", "No Watermark"] },
      { name: "Pinokio", url: "https://pinokio.computer", desc: "A magical browser that installs any open source AI in one click on your PC.", badges: ["100% Free", "Open Source"] },
      { name: "Suno AI", url: "https://suno.com", desc: "Generate full studio-quality songs (lyrics and music) for free every day.", badges: ["Free Credits", "Audio"] },
      { name: "ElevenLabs", url: "https://elevenlabs.io", desc: "The best AI voice generator in the world. Thousands of free characters every month.", badges: ["Freemium", "High Quality"] },
      { name: "LM Studio", url: "https://lmstudio.ai", desc: "Discover, download, and chat with any local AI, entirely offline.", badges: ["100% Free", "Local"] },
      { name: "Krea AI", url: "https://www.krea.ai", desc: "Real-time image generation and upscaling. Incredibly powerful and free.", badges: ["Freemium", "No Watermark"] },
      { name: "Civitai", url: "https://civitai.com", desc: "The largest platform to find AI image generation models (Stable Diffusion).", badges: ["100% Free", "Open Source"] },
      { name: "Phind", url: "https://www.phind.com", desc: "AI search engine designed specifically for developers. Very fast answers.", badges: ["100% Free", "No Watermark"] }
    ]
  }
];
