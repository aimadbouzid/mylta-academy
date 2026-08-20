import React from 'react'
import { ShoppingCart, PenTool, Zap, TrendingUp, Rocket, Layout, Brain, Mic, Share2, Star, GraduationCap, Video, Youtube } from 'lucide-react'

export const masterclassCategories = [
  {
    id: "business",
    name: "Business & Sales",
    title: "Business, Sales & Funnels",
    desc: "The most aggressive and profitable techniques to convert simple visitors into loyal customers.",
    icon: <ShoppingCart size={18} />,
    color: "text-orange-500",
    strategies: [
      {
        title: "20 000 000 000 DZD Offers (Alex Hormozi)",
        icon: <ShoppingCart className="text-orange-500" size={24} />,
        color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
        desc: "The art of creating an irresistible offer.",
        points: [
          "🎁 Add bonuses to inflate perceived value.",
          "⚡️ Shorten the wait time to the result.",
          "🛡️ Remove the risk (Strong Guarantee or 'Money Back')."
        ]
      },
      {
        title: "Hook, Story, Offer (Russell Brunson)",
        icon: <PenTool className="text-emerald-500" size={24} />,
        color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
        desc: "The secret framework for selling online.",
        points: [
          "🎣 HOOK: Stop the user's scroll.",
          "📖 STORY: Tell a true story that builds empathy.",
          "🔥 OFFER: Pitch your magic offer at the end."
        ]
      },
      {
        title: "Brutal Copywriting (Tugan Bara)",
        icon: <Zap className="text-red-600 dark:text-red-400" size={24} />,
        color: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-500/20",
        desc: "Strike right where it hurts.",
        points: [
          "🩸 Talk about deep pains, not features.",
          "😈 Find a common enemy to defeat (the system, banks...).",
          "💊 Present your product as the only rescue pill."
        ]
      },
      {
        title: "The AARRR Model (Growth Hacking)",
        icon: <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />,
        color: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-500/20",
        desc: "The Silicon Valley startup funnel.",
        points: [
          "🧲 Acquisition: Bring in mass traffic.",
          "✨ Activation: Create the 'Wow' effect for the visitor.",
          "💸 Revenue & Retention: Make them pay, and make them return."
        ]
      },
      {
        title: "Rapid Testing (Yomi Denzel)",
        icon: <Rocket className="text-pink-500" size={24} />,
        color: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-500/20",
        desc: "Don't waste 3 months on an uncertain product.",
        points: [
          "⏱️ Create your express store in 2 hours max.",
          "💸 Spend just10 000 DZD on ads (TikTok or Meta).",
          "🔪 If it works: Scale. If it flops: Cut everything with no regrets."
        ]
      },
      {
        title: "Blue Ocean Strategy",
        icon: <Layout className="text-sky-500" size={24} />,
        color: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20",
        desc: "Create your own category.",
        points: [
          "🦈 Flee the 'Red Oceans' (markets full of competitors).",
          "🎨 Combine 2 markets to create your own virgin niche.",
          "🏆 Don't try to be the 'best', be the 'only one'."
        ]
      }
    ]
  },
  {
    id: "mindset",
    name: "Productivity & Mindset",
    title: "Productivity & Mental Models",
    desc: "Optimize your brain, save time, and make better strategic decisions.",
    icon: <Brain size={18} />,
    color: "text-blue-500",
    strategies: [
      {
        title: "The Second Brain (Ali Abdaal)",
        icon: <Brain className="text-blue-500" size={24} />,
        color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
        desc: "Your brain is for thinking, not for remembering.",
        points: [
          "📥 Capture absolutely EVERYTHING you see (Notion, Obsidian).",
          "📂 Organize information visually.",
          "🚀 Create projects from your own notes."
        ]
      },
      {
        title: "Leverage (Naval Ravikant)",
        icon: <TrendingUp className="text-yellow-500" size={24} />,
        color: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20",
        desc: "Hard work doesn't make you rich. Leverage does.",
        points: [
          "🚫 Money and Employees require other people's permission.",
          "💻 Code (software) and media (videos) are infinite.",
          "😴 Create things that work for you while you sleep."
        ]
      },
      {
        title: "Pareto Principle 80/20 (Tim Ferriss)",
        icon: <Zap className="text-teal-500" size={24} />,
        color: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-500/20",
        desc: "Focus on what matters.",
        points: [
          "🎯 80% of your results come from 20% of your actions.",
          "🗑️ Delete or delegate the 80% of useless tasks.",
          "⭐ Isolate and master your zone of genius."
        ]
      },
      {
        title: "The 1% Rule (Atomic Habits)",
        icon: <TrendingUp className="text-fuchsia-500" size={24} />,
        color: "bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-500/20",
        desc: "Success is the accumulation of small wins.",
        points: [
          "📈 Aim for just 1% improvement every day.",
          "🔄 Focus on a good system, not a goal.",
          "🗓️ At the end of the year, you will be 37 times better."
        ]
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Creation",
    title: "Marketing, Content & Retention",
    desc: "The art of capturing attention on social networks and building a loyal audience.",
    icon: <Mic size={18} />,
    color: "text-purple-500",
    strategies: [
      {
        title: "The 3 Second Rule (MrBeast)",
        icon: <Video className="text-red-500" size={24} />,
        color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20",
        desc: "Attention is rare. Everything happens at the beginning.",
        points: [
          "🚨 If it doesn't slap in 3 seconds, you've lost.",
          "🤯 Your intro must promise massive value immediately.",
          "✂️ Cut all silences and get straight to the point."
        ]
      },
      {
        title: "The Storytelling of Failure (Oussama Ammar)",
        icon: <Mic className="text-purple-500" size={24} />,
        color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
        desc: "People buy your story, not your product.",
        points: [
          "📉 Don't just talk about your successes (it seems arrogant).",
          "💔 Tell your struggles, your doubts, your past failures.",
          "🫂 Vulnerability is what unites a true tribe."
        ]
      },
      {
        title: "The Creation System (Justin Welsh)",
        icon: <Share2 className="text-blue-600 dark:text-blue-400" size={24} />,
        color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20",
        desc: "Automate your content without burning out.",
        points: [
          "✍️ Write 1 very long format per week (e.g. Newsletter).",
          "✂️ Cut it into 6 short posts for your socials.",
          "♻️ Analyze what works and sell it as a digital product."
        ]
      },
      {
        title: "The 1000 True Fans (Kevin Kelly)",
        icon: <Star className="text-indigo-500" size={24} />,
        color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
        desc: "No need for millions of subscribers to make a living.",
        points: [
          "❤️ Find 1000 fans ready to buy everything you do.",
          "💰 If they pay20 000 DZD/year = you earn20 000 000 DZD.",
          "🤝 Favor a small but highly engaged audience."
        ]
      },
      {
        title: "Start With Why (Simon Sinek)",
        icon: <GraduationCap className="text-cyan-500" size={24} />,
        color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20",
        desc: "They don't buy what you do, but why you do it.",
        points: [
          "🌍 WHY: Explain your mission and beliefs.",
          "⚙️ HOW: Show your unique process.",
          "📦 WHAT: Finally, present your final product."
        ]
      }
    ]
  },
  {
    id: "videos",
    name: "📺 Free Videos",
    title: "YouTube Videos & Resources",
    desc: "The best free masterclasses on YouTube offering resources in bio.",
    icon: <Youtube size={18} />,
    color: "text-red-500",
    videos: [
      {
        id: "v1",
        title: "30 Secret AI Tools (100% Free)",
        channel: "Léo Duff / Tech",
        desc: "An incredible list of lesser-known but overpowered AI tools. Check the description to get his free Notion file.",
        url: "https:www.youtube.com/results?search_query=leo+duff+outils+ia",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v2",
        title: "How to Create an App without Coding in 1H",
        channel: "Shubham Sharma",
        desc: "The No-Code king in France. He shows how to use FlutterFlow and Make, and often offers his automation 'Blueprints' in Bio.",
        url: "https:www.youtube.com/results?search_query=shubham+sharma+no+code",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v3",
        title: "Create a Business with 0 Audience",
        channel: "Antoine BM",
        desc: "How to launch a profitable project with nobody to listen to you initially. Antoine often offers free PDFs or mind maps in his description.",
        url: "https:www.youtube.com/results?search_query=antoine+bm+0+audience",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v4",
        title: "How I sold my SaaS for 30 000 000 000 DZD",
        channel: "Guillaume Moubeche",
        desc: "The CEO of Lemlist explains his Cold Emailing strategy. A summary of raw value with email templates often offered in the bio.",
        url: "https:www.youtube.com/results?search_query=guillaume+moubeche+lemlist",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v5",
        title: "The method to find clients (0 to 10k/month)",
        channel: "Yomi Denzel / E-com",
        desc: "The exact customer acquisition strategies. In his bios, he often offers free basic training or E-commerce resources.",
        url: "https:www.youtube.com/results?search_query=yomi+denzel+trouver+des+clients",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v6",
        title: "Learn Webflow from A to Z (Full Tutorial)",
        channel: "Théo Lion",
        desc: "The best introduction to creating professional sites. Check the description for links to free Webflow templates.",
        url: "https:www.youtube.com/results?search_query=theo+lion+webflow",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v7",
        title: "Psychological Analysis: Why MrBeast Succeeds?",
        channel: "Marketing Mania",
        desc: "Stan Leloup decodes human psychology and retention strategies. An analysis document is very often available in the description.",
        url: "https:www.youtube.com/results?search_query=marketing+mania+mrbeast",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v8",
        title: "How to become a Productivity Monster",
        channel: "Oussama Ammar",
        desc: "His best methods to work radically and without distraction. Several useful links and book recommendations below the video.",
        url: "https:www.youtube.com/results?search_query=oussama+ammar+productivite",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v9",
        title: "Become Financially Independent with AI",
        channel: "Tugan Bara",
        desc: "Brutal analysis of the current market and how to exploit it with copywriting. Always free masterclasses via the links in bio.",
        url: "https:www.youtube.com/results?search_query=tugan+bara+copywriting+ia",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v10",
        title: "The Ultimate Guide to Facebook Ads",
        channel: "Joseph Rousseau / J&J",
        desc: "A training literally offered on YouTube by Francophone e-commerce experts. Their targeting templates are often externally linked.",
        url: "https:www.youtube.com/results?search_query=facebook+ads+guide+complet",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v11",
        title: "How to generate 10k/month with YouTube 'Cash Cow'",
        channel: "Oseille TV",
        desc: "Complete tutorial on creating automated YouTube channels (without showing your face). List of recommended tools available in the description.",
        url: "https:www.youtube.com/results?search_query=oseille+tv+cash+cow",
        icon: <Youtube className="text-red-500" size={32} />
      },
      {
        id: "v12",
        title: "The Mindset of a Millionaire",
        channel: "Alec Henry",
        desc: "Overcome your fears, overcome procrastination, and dare to launch into entrepreneurship. Often accompanied by a free audit offer in the description.",
        url: "https:www.youtube.com/results?search_query=alec+henry+mindset",
        icon: <Youtube className="text-red-500" size={32} />
      }
    ]
  }
];

export const labIdeasData = [
  {
    title: "How the 2026 AI replaced 90% of my work",
    type: "TikTok / Reel",
    niche: "Tech / Business",
    difficulty: "Medium",
    virality: 98,
    steps: [
      "Make a shocking hook about generative AI in 2026",
      "Show a fully automated workflow on screen",
      "Conclude with a call to action to subscribe"
    ]
  },
  {
    title: "The secret of the Instagram algorithm in 2027",
    type: "Insta Carousel",
    niche: "Marketing",
    difficulty: "Easy",
    virality: 95,
    steps: [
      "Page 1: Catchy title with a crazy number",
      "Pages 2-5: Break down the new engagement metric",
      "Page 6: The trick to hack this metric today"
    ]
  },
  {
    title: "3 Businesses to launch in 2027 with 0 DZD",
    type: "TikTok",
    niche: "Entrepreneurship",
    difficulty: "Easy",
    virality: 99,
    steps: [
      "Very dynamic visual hook (fast-paced style)",
      "List 3 unexplored niches thanks to new techs",
      "End with 'The last one is the most profitable'"
    ]
  },
  {
    title: "My VR setup to work in 2026",
    type: "Insta Reel",
    niche: "Lifestyle / Tech",
    difficulty: "Hard",
    virality: 92,
    steps: [
      "Show a fluid reality vs virtual reality transition",
      "Explain how VR doubles productivity",
      "Ask in comments: 'Ready to work like this?'"
    ]
  },
  {
    title: "Why influencers will disappear in 2027",
    type: "Short Video",
    niche: "Analysis / Controversy",
    difficulty: "Medium",
    virality: 97,
    steps: [
      "Controversial hook on the end of human influence",
      "Introduce hyper-realistic AI influencers",
      "Invite debate in the comments section"
    ]
  },
  {
    title: "Hacking your dopamine: The 2026 method",
    type: "TikTok",
    niche: "Personal Development",
    difficulty: "Easy",
    virality: 94,
    steps: [
      "Use a dark/aesthetic filter",
      "Explain the concept of 'Dopamine Fasting 2.0'",
      "Give an action plan over 3 days"
    ]
  },
  {
    title: "Create a clothing brand in 2h (2027 Version)",
    type: "Reel / TikTok",
    niche: "E-commerce",
    difficulty: "Hard",
    virality: 96,
    steps: [
      "Generate the design with text-to-3D AI",
      "Connect to an automated print-on-demand factory",
      "Launch AI-generated ads"
    ]
  },
  {
    title: "The jobs that pay 10k/month in 2026",
    type: "Insta Carousel",
    niche: "Finance / Career",
    difficulty: "Easy",
    virality: 89,
    steps: [
      "Slide 1: 'Forget coding, do this.'",
      "List jobs like 'Prompt Architect', 'AI Ethicist'",
      "Offer free training in the bio link"
    ]
  },
  {
    title: "I live in the Metaverse for 24h",
    type: "Mini-Vlog TikTok",
    niche: "Entertainment",
    difficulty: "Hard",
    virality: 98,
    steps: [
      "Film clips of life in mixed reality",
      "Show funny or absurd interactions",
      "Review the experience at the end"
    ]
  },
  {
    title: "The best tool of 2026 that nobody knows",
    type: "Insta Reel",
    niche: "Tools / Tech",
    difficulty: "Easy",
    virality: 93,
    steps: [
      "Hook: 'Don't scroll if you want to save time'",
      "Quick and mind-blowing demo of the tool on screen",
      "Ask to comment 'LINK' to receive the tool in DM"
    ]
  }
];
