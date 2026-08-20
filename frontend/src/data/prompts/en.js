export const promptsCategories = [
  {
    id: "marketing",
    name: "Marketing & Sales",
    prompts: [
      {
        title: "AIDA Sales Page Generator",
        prompt: "Act as an expert copywriter. Write a complete sales page using the AIDA framework (Attention, Interest, Desire, Action) to sell [YOUR PRODUCT]. The target audience is [YOUR TARGET]. The tone should be persuasive and urgent but not aggressive."
      },
      {
        title: "Onboarding Email Sequence",
        prompt: "Create a 5-email welcome sequence for new signups to my SaaS tool [TOOL NAME]. Email 1 is the welcome, Email 2 shows a use case, Email 3 gives a productivity hack, Email 4 introduces the paid offer, Email 5 is FOMO/Urgency."
      },
      {
        title: "Facebook Ads Video Scripts",
        prompt: "Give me 3 different scripts for a 30-second Facebook Ads video ad. Product: [PRODUCT]. Script 1 should target the pain point, Script 2 should be a fictional customer testimonial, and Script 3 should show a 'Before/After'."
      },
      {
        title: "Customer Avatar (Persona) Creator",
        prompt: "Build an ultra-detailed marketing persona for my company that sells [PRODUCT]. Include their name, age, salary, deep frustrations, unspoken desires, what they hate about current solutions, and their favorite brands."
      },
      {
        title: "Irresistible Offer Generator (Hormozi)",
        prompt: "Use Alex Hormozi's 'Grand Slam Offer' framework for my service of [SERVICE]. Help me define: 1. Dream Outcome, 2. Perceived Likelihood of Achievement, 3. Time Delay, 4. Effort and Sacrifice. Suggest 3 unique bonuses to increase value."
      },
      {
        title: "Elevator Pitch",
        prompt: "Write 3 30-second 'Elevator Pitches' to present my startup [STARTUP NAME] which helps [TARGET] to [SOLUTION]. I want a very technical version for investors, and a simplified version (like for a 10-year-old child)."
      },
      {
        title: "PAS Framework (Problem, Agitate, Solve)",
        prompt: "Write a short landing page using the PAS format. Product: [PRODUCT]. Main pain point: [PAIN]. Agitate the problem by showing the dramatic consequences of doing nothing, then present the solution brilliantly."
      },
      {
        title: "Email Subject Line Generator (Open Rate)",
        prompt: "Generate 20 clickbaity, curious, and persuasive email subject lines to announce the launch of my new product: [PRODUCT]. I want a mix of questions, urgency, and personal stories."
      },
      {
        title: "Customer Objections & Responses",
        prompt: "List the 10 most common objections my customers might have before buying [MY PRODUCT] (price, time, trust...). Then write an unyielding refutation argument for each of these 10 objections."
      },
      {
        title: "Press Release",
        prompt: "Write an official and professional press release to announce the launch of [MY PROJECT]. It must follow journalistic standards, include a quote from the founder, and have a catchy headline for Tech journalists."
      },
      {
        title: "Cold Call Script",
        prompt: "Act like the Wolf of Wall Street. Write a cold call script to sell [PRODUCT] to [TARGET]. The script must have a 10-second hook to break the ice, rapid qualification, and handling of the 3 main objections.",
        technique: "Pattern Interrupt: Break the prospect's mental pattern in the first few seconds to prevent them from hanging up instinctively."
      },
      {
        title: "Advanced AIDA Framework (Neuro-Marketing)",
        prompt: "Write a Facebook ad using the AIDA framework coupled with cognitive biases. Product: [PRODUCT]. Use the scarcity bias for Action, the authority bias for Interest, and loss aversion for Desire.",
        technique: "Loss Aversion: Humans are twice as motivated by the fear of losing something than by the desire to gain something."
      }
    ]
  },
  {
    id: "social",
    name: "Social Media",
    prompts: [
      {
        title: "Viral LinkedIn Post (Storytelling Format)",
        prompt: "Write a viral LinkedIn post based on a mistake I made in my business [YOUR BUSINESS]. Start with a highly polarizing hook. Use short sentences (1 idea per line). End with 3 lessons learned and a question for engagement."
      },
      {
        title: "Educational Twitter (X) Thread",
        prompt: "Write a 10-tweet Twitter Thread on the topic: [YOUR TOPIC]. The first tweet must be a killer 'Hook' that makes people want to read on. Use emojis sparingly. The last tweet should promote my newsletter [LINK]."
      },
      {
        title: "TikTok / YouTube Shorts Video Script",
        prompt: "Write a word-for-word script for a 45-second TikTok. The topic is [TOPIC]. Divide the script into 2 columns: 'Visual/Action' and 'Voiceover'. Use a Hook in the first 3 seconds to keep people from scrolling."
      },
      {
        title: "30-Day Content Calendar",
        prompt: "Act as a Social Media Manager. Create a 30-day content calendar for Instagram and TikTok. My niche is [NICHE]. Suggest a specific post idea each day with a format (Reel, Carousel, Photo) and goal (Sales, Value, Entertainment)."
      },
      {
        title: "Replies to Hater Comments",
        prompt: "I receive many negative comments telling me that [THE CRITICISM]. Write 5 diplomatic, professional, yet sharp responses to reframe these comments without sounding aggressive or defensive."
      },
      {
        title: "Instagram Carousel Ideas",
        prompt: "Generate 10 highly savable Instagram Carousel ideas (high save-rate) in the [NICHE] niche. For each idea, give me the cover title (Slide 1) and the outline for the next 5 slides."
      },
      {
        title: "Optimized Instagram / Twitter Bio",
        prompt: "Propose 5 different versions for my Instagram/Twitter bio. I am a [YOUR PROFESSION] who helps [YOUR TARGET] to [YOUR RESULT]. I want bios that optimize conversion with a clear Call-to-Action to my link."
      },
      {
        title: "Stories Content (Engagement)",
        prompt: "Give me 15 interactive Story ideas (with Polls, Questions, Quizzes) to engage my audience today. My area of expertise is [DOMAIN]."
      },
      {
        title: "Finding Influencers (Strategy)",
        prompt: "Propose a step-by-step strategy to contact micro-influencers on Instagram and TikTok to promote my product [PRODUCT]. Also write the DM or email template to approach them without sounding desperate."
      },
      {
        title: "Content Repurposing",
        prompt: "Here is the link/text of a long YouTube video I made: [TEXT/IDEA]. Transform this text into: 1 LinkedIn Post, 1 Twitter Thread, 1 TikTok Script, and 1 Email for my newsletter."
      }
    ]
  },
  {
    id: "seo",
    name: "SEO & Web Copywriting",
    prompts: [
      {
        title: "SEO Optimized Blog Article",
        prompt: "Write a 1000-word blog article on the main keyword '[KEYWORD]'. Use relevant H2 and H3 tags. The tone should be expert. Include a captivating intro, a bulleted list, and a conclusion with a call to action."
      },
      {
        title: "Long-Tail Keyword Research",
        prompt: "Generate a list of 30 long-tail keywords (low competition, high intent) around the theme '[THEME]'. Group them by search intent: Informational, Navigational, Commercial, Transactional."
      },
      {
        title: "Existing Content Audit",
        prompt: "Here is an article from my blog: [PASTE ARTICLE]. Analyze this article from an SEO perspective and give me 10 specific recommendations to improve its Google ranking (semantics, structure, keyword density)."
      },
      {
        title: "Title & Meta Description Generator",
        prompt: "For my webpage about [TOPIC], generate 10 Title tag proposals (max 60 characters) optimized for CTR, and 5 Meta Descriptions (max 155 characters) integrating the keyword '[KEYWORD]'."
      },
      {
        title: "Site Map (Semantic Siloing)",
        prompt: "I am creating an e-commerce site in the [NICHE] niche. Propose a semantic silo site architecture (Content Silo). Provide the main categories (Silo), subcategories, and 5 blog article ideas per category."
      },
      {
        title: "E-commerce Product Page Optimization",
        prompt: "Write an SEO product description for my e-commerce store. Product: [PRODUCT]. Features: [FEATURES]. The description must be at least 300 words, handle objections, and use SEO transition words."
      },
      {
        title: "Netlinking Strategy (Backlinks)",
        prompt: "Give me 10 unconventional and actionable strategies to get high-quality backlinks for my blog about [THEME]. Write the outreach email template to send to bloggers."
      },
      {
        title: "Brief for a Web Copywriter",
        prompt: "Generate an extremely detailed SEO writing brief to give to my freelance copywriter. The article must be about [TOPIC]. The brief must include: Primary/secondary keywords, exact required H2/H3 structure, mandatory internal linking."
      },
      {
        title: "Frequently Asked Questions (FAQ Schema.org)",
        prompt: "Generate a list of 10 frequently asked questions on Google (People Also Ask) regarding [TOPIC]. Write concise answers of maximum 40 words, ideal for winning the Featured Snippet (Position Zero)."
      },
      {
        title: "Image Optimization (Alt Text)",
        prompt: "For the following 5 images in my article about [TOPIC]: 1. A car, 2. A computer, etc... Generate alternative texts (Alt Text) that are perfect for SEO, neither too short nor spammy."
      }
    ]
  },
  {
    id: "dev",
    name: "Development & Code",
    prompts: [
      {
        title: "Complex Code Explanation",
        prompt: "Act as a computer science professor. Here is a block of code I don't understand: [CODE]. Explain to me line by line what this code does, its purpose, and the time complexity (Big O)."
      },
      {
        title: "Unit Test Generator (Jest/Mocha)",
        prompt: "Here is a [LANGUAGE] function: [FUNCTION CODE]. Write a comprehensive unit test suite for this function covering normal cases, edge cases, and error handling."
      },
      {
        title: "Refactoring & Clean Code",
        prompt: "Refactor this messy code: [CODE]. Make it more readable, apply SOLID principles, give better variable names, and optimize its performance. Then explain what you changed and why."
      },
      {
        title: "Language Conversion",
        prompt: "Translate this script written in [SOURCE LANGUAGE] to [TARGET LANGUAGE]. Ensure you use the proper idiomatic practices of the target language (e.g., list comprehension in Python, array methods in JS): [CODE]."
      },
      {
        title: "Writing Complex SQL Queries",
        prompt: "I have two tables: 'users' (id, name, email) and 'orders' (id, user_id, amount, date). Write an optimized SQL query that returns the name and email of the 5 users who have spent the most money in total this month."
      },
      {
        title: "Regex Generator (Regular Expressions)",
        prompt: "Write a Regular Expression (Regex) that extracts [WHAT YOU WANT TO EXTRACT] from a large text. Then explain every symbol in your regex so I can understand it."
      },
      {
        title: "Fake Data Generation (Mock Data)",
        prompt: "Generate a JSON array containing 10 mock objects representing [ENTITY, e.g., Users]. Each object must have the following properties: id (uuid), name, email, age, full address, and a boolean 'isActive'."
      },
      {
        title: "Docker / Docker-compose Configuration",
        prompt: "Generate a complete 'docker-compose.yml' file for a standard web application. I need a Node.js container (frontend), a Python/Django container (backend), and a PostgreSQL database. Add environment variables."
      },
      {
        title: "Bug Hunter (Debugger)",
        prompt: "My application is crashing. Here is my code: [CODE]. And here is the exact console error: [ERROR]. Find where the bug comes from, explain the cause of the error, and provide the complete corrected code."
      },
      {
        title: "Automatic Documentation (JSDoc/Docstring)",
        prompt: "Add comprehensive documentation (JSDoc or Docstring style) to this code file: [CODE]. Document every function, its parameters, its return type, and add an usage example in the comments."
      }
    ]
  },
  {
    id: "business",
    name: "Business & Startup",
    prompts: [
      {
        title: "Startup Idea Brainstorming",
        prompt: "Act as the CEO of Y Combinator. I'm interested in the [DOMAIN] market. Give me 10 unconventional B2B SaaS startup ideas in this sector that solve painful and urgent problems."
      },
      {
        title: "Create a Perfect Pitch Deck",
        prompt: "Structure a 10-slide Pitch Deck for my startup [NAME] which does [PROJECT]. Detail exactly what I need to write on each slide (Problem, Solution, Market, Business Model, Team...) to convince investors."
      },
      {
        title: "Competitive SWOT Analysis",
        prompt: "Perform an extremely detailed SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for a company launching in [DOMAIN], against its main competitor [COMPETITOR NAME]."
      },
      {
        title: "Finding Product-Market Fit",
        prompt: "I just launched [PRODUCT] and I have no sales. Give me a 30-day action plan, step-by-step, to pivot, interview my users, and finally find my Product-Market Fit."
      },
      {
        title: "Pricing Strategy",
        prompt: "I sell a SaaS software for [DOMAIN]. Propose 3 different pricing models (e.g., Freemium, Usage-based, Flat-rate). For each, explain the psychology behind the price and how to encourage upselling."
      },
      {
        title: "SOP Creation (Standard Operating Procedures)",
        prompt: "Write a detailed step-by-step SOP (Standard Operating Procedure) to delegate the following task to a virtual assistant: [YOUR TASK]. Be so clear that a 10-year-old child could follow the procedure without error."
      },
      {
        title: "Contract/Salary Negotiation",
        prompt: "I need to negotiate with [INTERLOCUTOR] to get [WHAT YOU WANT]. Act like an FBI negotiator (Chris Voss). Give me 5 opening lines or negotiation techniques ('Mirroring', 'Labeling') to use to win."
      },
      {
        title: "Launch Strategy (Go-to-Market)",
        prompt: "Detail an 8-week Go-to-Market (GTM) strategy for the launch of my mobile app in [DOMAIN]. Include acquisition channels, partnerships, and growth hacks for the first 1000 users."
      },
      {
        title: "Finding B2B Partnerships",
        prompt: "I sell [PRODUCT]. Make a list of 10 types of non-competing but complementary businesses I could partner with for B2B Cross-selling. Write the outreach email to propose this win-win partnership."
      },
      {
        title: "Investor Interview Simulation",
        prompt: "Act as an aggressive Venture Capital (VC) investor. Ask me the most difficult and tricky question about my [DOMAIN] business. Wait for my answer, then ruthlessly critique it to train me."
      }
    ]
  },
  {
    id: "productivity",
    name: "Productivity & Organization",
    prompts: [
      {
        title: "Perfect Weekly Planner",
        prompt: "Act as my productivity coach. I need to accomplish these 5 major goals this week: [GOALS]. I have 4 hours of deep work per day. Create a time-blocked schedule from Monday to Friday."
      },
      {
        title: "The Eisenhower Matrix",
        prompt: "Here is the list of everything I have to do today: [TASK LIST]. Sort these tasks into the Eisenhower matrix (Urgent/Important, Not Urgent/Important, Urgent/Not Important, Not Urgent/Not Important)."
      },
      {
        title: "Overcome Procrastination",
        prompt: "I keep putting off the following task: [TASK]. Ask me psychological questions to understand the root blockage, and give me an absurd 'Micro-steps' action plan to start within the next 2 minutes."
      },
      {
        title: "Organizing the 'Second Brain'",
        prompt: "I want to use Tiago Forte's PARA method on my Notion. Help me sort these 20 elements of my life (current projects, hobbies, book notes, administrative papers) into the Projects, Areas, Resources, and Archives folders."
      },
      {
        title: "Non-Fiction Book Summary",
        prompt: "Summarize the book '[BOOK TITLE]'. Don't just give me a flat summary. Give me the 3 core concepts, and explain how to concretely apply each concept in my job as a [YOUR PROFESSION]."
      },
      {
        title: "SMART Goals Generator",
        prompt: "I have a very vague goal: 'I want to make more money with my blog'. Transform this goal into a S.M.A.R.T goal (Specific, Measurable, Achievable, Realistic, Time-bound) with precise KPIs to track."
      },
      {
        title: "Millionaire Morning Routine",
        prompt: "Create a realistic 60-minute Morning Routine based on neuroscience (Huberman Lab) to maximize my focus before 9am. Do not include impossible things, I must be able to stick to it."
      },
      {
        title: "Workspace Optimization",
        prompt: "I work from home (Remote). Give me 10 strict rules of ergonomics and environmental psychology to optimize my desk to reach a state of 'Flow' faster every day."
      },
      {
        title: "Weekly Review",
        prompt: "Act as a caring manager. I'll give you what I did this week. Do a review, point out moments where I wasted time, and help me define my absolute top 3 priorities (Big 3) for Monday."
      },
      {
        title: "Extreme Delegation",
        prompt: "Here is everything I do in a workday: [YOUR DAY]. Identify low-value tasks (less than 4 000 DZD/hour) that I should delegate, and tell me exactly on which platforms (Fiverr, Upwork) to hire someone."
      }
    ]
  },
  {
    id: "midjourney",
    name: "Design & Midjourney",
    prompts: [
      {
        title: "Ultra-Realistic Portrait (Cinematic)",
        prompt: "Cinematic portrait photography of a [SUBJECT DESCRIPTION, e.g., cyberpunk hacker], neon lighting, 85mm lens, depth of field, dramatic shadows, highly detailed, photorealistic, 8k resolution, shot on Arri Alexa --ar 16: 9 --style raw --v 6.0"
      },
      {
        title: "Minimalist Logo Creation",
        prompt: "Minimalist vector logo of a [OBJECT/ANIMAL, e.g., fox], flat design, clean lines, geometric shapes, white background, corporate style, dribbble, behance, --no shading, realistic details --v 6.0"
      },
      {
        title: "Web Interface Design (UI/UX)",
        prompt: "Beautiful UI UX design of a modern dashboard web application for [SUBJECT, e.g., crypto trading], dark mode, glassmorphism, clean layout, dashboard layout, vibrant neon accents, highly detailed, dribbble top shot --ar 16: 9"
      },
      {
        title: "Interior Architecture",
        prompt: "Interior design photography of a luxury modern living room, wabi-sabi style, large windows overlooking a forest, warm sunlight, beige and wood tones, high end furniture, architectural digest, photorealistic --ar 16: 9 --v 6.0"
      },
      {
        title: "3D Character (Pixar Style)",
        prompt: "3D render of a cute little [CHARACTER/ANIMAL], Pixar style, Disney animation style, big expressive eyes, octane render, unreal engine 5, soft lighting, vibrant colors, detailed textures, 8k --ar 4: 5 --v 6.0"
      },
      {
        title: "Epic Fantasy Landscape",
        prompt: "Epic fantasy landscape, giant ancient ruins in a lush jungle, glowing magical crystals, cinematic lighting, concept art, trending on artstation, masterpiece, highly detailed, greg rutkowski style --ar 21: 9"
      },
      {
        title: "Pattern / Texture Generation",
        prompt: "Seamless pattern of [SUBJECT, e.g., tropical leaves and flowers], flat design, pastel colors, wallpaper design, vector art, symmetric, elegant --tile --v 6.0"
      },
      {
        title: "Vintage Illustration Style",
        prompt: "Vintage 1950s comic book illustration of [SUBJECT], pop art style, halftone dots, vibrant retro colors, bold black outlines, retro aesthetic --ar 3: 4"
      },
      {
        title: "Culinary Photography (Food)",
        prompt: "Professional food photography of a delicious [DISH, e.g., gourmet burger with melted cheese], dark moody background, studio lighting, smoke, macro photography, extremely detailed, mouthwatering, 8k --ar 4: 5"
      },
      {
        title: "3D Isometric",
        prompt: "Isometric 3d rendering of a miniature [PLACE, e.g., cyberpunk city block], tilt shift photography, highly detailed, clay render style, vibrant lighting, octane render, plain background --v 6.0"
      }
    ]
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Dropshipping",
    prompts: [
      {
        title: "Winning Product Research",
        prompt: "Act as an E-commerce expert. Give me 10 'Winning' product ideas for dropshipping in the [NICHE] niche. Each product must have a 'Wow Effect', solve a deep problem, and have a good margin."
      },
      {
        title: "Product Description (Shopify)",
        prompt: "Write a high-converting Shopify product description for [PRODUCT]. Use the structure: 1. Emotional hook. 2. Presentation of 3 key benefits with bullet points. 3. Technical specifications. 4. Money-back guarantee."
      },
      {
        title: "TikTok Script / UGC Dropshipping",
        prompt: "Generate 3 scripts for UGC (User Generated Content) TikTok videos to sell [MY PRODUCT]. Each script must be under 15 seconds. Include the exact visual movement the actor must do (Ex: 'Holds product to the camera in shock')."
      },
      {
        title: "Retargeting Campaign (Facebook)",
        prompt: "Create 3 ad angles (copy) for a Facebook Retargeting campaign targeting people who added [PRODUCT] to cart but didn't buy. Play on urgency, scarcity, and social proof (reviews)."
      },
      {
        title: "Abandoned Cart Email",
        prompt: "Write an abandoned cart recovery email. The email subject line must be very curious. The email body should remind them of the product, offer an exclusive 10% promo code expiring in 24h, and reassure them about shipping."
      },
      {
        title: "Customer Reviews Generator (Mockups)",
        prompt: "Generate 15 highly realistic fake customer reviews (not too perfect, with some minor feedback) for my product [PRODUCT]. Alternate reviews from men, women, and the length of the texts."
      },
      {
        title: "Upsell / Cross-sell Strategy",
        prompt: "My main product is [PRODUCT]. Suggest 5 complementary product ideas (Cross-sell) or upgrades (Upsell) that I could offer right after payment (Post-Purchase Upsell)."
      },
      {
        title: "Product Page SEO",
        prompt: "Optimize my [PRODUCT] page for Google. Give me the optimized H1 title, meta description, 5 H2 tags, and a list of long-tail keywords to naturally include in the description."
      },
      {
        title: "Create a Bundle Offer",
        prompt: "I sell [PRODUCT]. Help me create an irresistible Bundle offer. Find a catchy name for the pack, calculate the perceived discount percentage, and explain why the customer would make a mistake buying a single unit."
      },
      {
        title: "Customer Service Reply",
        prompt: "A customer is very angry because their [PRODUCT] package is 2 weeks late. Write a customer service message to calm the situation down, apologize professionally, and offer compensation without refunding immediately."
      }
    ]
  },
  {
    id: "youtube",
    name: "YouTube & Video",
    prompts: [
      {
        title: "Video Ideas Generator",
        prompt: "Act as a YouTube strategist. My channel is about [TOPIC]. Give me 20 video ideas with absolute viral potential. Combine 2 opposing niches or use the 'I tried X for Y days' format to attract curiosity."
      },
      {
        title: "Clickbait Titles Generator (Good Ones)",
        prompt: "I'm making a video about [TOPIC]. Give me 15 highly optimized YouTube titles for CTR (Click-Through Rate). The titles must create a 'Curiosity Gap' (a mystery to solve) and be under 60 characters."
      },
      {
        title: "Perfect Intro Script",
        prompt: "The intro (first 30 seconds) is vital. Write the word-for-word intro for my video on [TOPIC]. Start with a shocking statement or closed question, prove your legitimacy, and state the video's promise very clearly."
      },
      {
        title: "Thumbnails Ideas",
        prompt: "For my video titled '[VIDEO TITLE]', give me 5 highly detailed visual concepts for the YouTube thumbnail. Specify the text to write (max 3 words), my facial expression, the background setting, and the foreground object."
      },
      {
        title: "Video Outline (Retention Structure)",
        prompt: "Structure this video on [TOPIC] to maximize Audience Retention (Watch Time). Divide it into clear chapters. Add 'Open Loops' (teasing) at the end of each chapter to force the viewer to watch the next one."
      },
      {
        title: "Call to Action (Subscribe)",
        prompt: "Write 3 different and non-cringy ways to ask my audience to subscribe and like in the middle of my video on [TOPIC]. It must be natural, short, and tied to the video's topic."
      },
      {
        title: "YouTube Description & SEO",
        prompt: "Write the description for my YouTube video on [TOPIC]. Optimize the first 2 lines for Google search. Include a table of contents with Timestamps, my social media links, and 10 relevant hashtags."
      },
      {
        title: "Sponsor Pitch",
        prompt: "Write a professional email to pitch [BRAND] and propose they sponsor my next YouTube video which will get around [NUMBER] views. The pitch must prove that my audience perfectly matches their target demographic."
      },
      {
        title: "Sponsor Integration",
        prompt: "I'm sponsored by [BRAND] for my video on [TOPIC]. Write the 60-second ad read. Make a smooth and humorous transition from my topic, present the problem, and the sponsor's solution."
      },
      {
        title: "Replying to Comments",
        prompt: "Generate 10 funny, short, and engaging replies (with emojis) that I could copy-paste to reply to generic comments ('Great video!', 'Thanks for the tip!') on my new video."
      }
    ]
  },
  {
    id: "students",
    name: "Students & Learning",
    prompts: [
      {
        title: "Feynman Technique (Simplification)",
        prompt: "Explain the complex concept of [CONCEPT] using the Feynman technique. That means: use very simple words, everyday analogies, as if you were explaining it to a 12-year-old child."
      },
      {
        title: "Flashcards Generator (Anki)",
        prompt: "Here is my course on [TOPIC]: [COURSE TEXT]. Generate a list of 20 very short questions/answers based on this text, formatted exactly to be imported into Anki or Quizlet."
      },
      {
        title: "Intensive Study Plan",
        prompt: "I have a very important exam on the subject [SUBJECT] in [NUMBER] days. I have [HOURS] a day to study. Create an intensive study plan based on Spaced Repetition and Active Recall."
      },
      {
        title: "Essay or Dissertation Grader",
        prompt: "Here is the essay I wrote: [TEXT]. Grade it harshly out of 20. Correct my grammar mistakes, highlight logical flaws in my argument, and suggest a better introduction."
      },
      {
        title: "Create a Thesis/Dissertation Outline",
        prompt: "I need to write a 50-page thesis on the topic: [TOPIC]. Propose a detailed outline with Introduction, 3 main Parts (I, II, III), sub-parts (A, B), and a conclusion. Suggest 5 authors or books to cite."
      },
      {
        title: "Language Learning",
        prompt: "Act as a native [LANGUAGE] speaker. Start a conversation with me so I can practice. Systematically correct my mistakes after each of my answers, and explain the associated grammar rule simply."
      },
      {
        title: "Mnemonics and Memory Aids",
        prompt: "I need to memorize the following list by heart: [LIST OF THINGS]. Create a funny mnemonic phrase or a weird mental story (Mind Palace) to help me remember this list perfectly in order."
      },
      {
        title: "Academic Translation",
        prompt: "Translate this text from [LANGUAGE 1] to [LANGUAGE 2] in an academic and formal manner, perfect for a university research paper. Do not translate literally, use appropriate technical jargon: [TEXT]"
      },
      {
        title: "Mock Exam Generator",
        prompt: "Act as a university professor. Generate a mock exam of [LEVEL/YEAR] level on the subject [SUBJECT]. The exam must contain 10 multiple-choice questions with 4 choices, and 2 open-ended essay questions. Provide the answer key at the end."
      },
      {
        title: "Finding Internships/Apprenticeships",
        prompt: "Write an impactful and modern cover letter to land an internship as a [JOB TITLE] at [COMPANY NAME]. Don't write a boring 'Dear Hiring Manager' letter. Make it a letter that proves my passion and what I can bring to THEM."
      }
    ]
  },
  {
    id: "ia-optimisation",
    name: "AI Optimization & Advanced Prompts",
    prompts: [
      {
        title: "Super-Prompt Generator (Meta-Prompting)",
        prompt: "You are an expert AI engineer. I want you to help me create the best possible prompt for the following task: [TASK]. Ask me 5 questions to refine the context, then suggest 3 increasingly complex iterations of the prompt.",
        technique: "Meta-Prompting: Using the AI to self-improve and generate its own optimal instructions."
      },
      {
        title: "Chain of Thought (Step-by-Step Reasoning)",
        prompt: "I want you to solve this complex logic problem: [PROBLEM]. Before giving me the final answer, explain your reasoning step by step. If you encounter a contradiction, point it out before continuing.",
        technique: "Chain of Thought (CoT): Forcing the AI to verbalize its intermediate reasoning drastically reduces hallucinations and logic errors."
      },
      {
        title: "Few-Shot Prompting (Learning by Example)",
        prompt: "Classify the tone of the following sentence. Here are examples:\n- 'This is a total disaster.' -> Negative\n- 'I am thrilled!' -> Positive\n- 'The weather is gray today.' -> Neutral\nNow classify this sentence: '[YOUR SENTENCE]'.",
        technique: "Few-Shot: Giving 2 to 5 clear examples of the expected output format to force the AI to adopt exactly that mold."
      },
      {
        title: "Act As (Roleplay with Constraints)",
        prompt: "Act as a tax lawyer with 20 years of experience. You must only use precise legal terms. Answer the following question: [QUESTION]. If the request is illegal, formally refuse by citing a fictional law article.",
        technique: "Persona & Constraints: Restricting the AI's probability space to avoid generic and bland answers."
      },
      {
        title: "Avoiding Unnecessary Token Consumption",
        prompt: "Summarize this 5000-word text: [TEXT]. Strict rule: Your final answer must not exceed 50 words in total. Do not generate any polite phrases (no 'Here is the summary...'). Give only the information.",
        technique: "Token Management: By banning filler sentences and setting strict limits, you massively save API credits on high volumes."
      }
    ]
  }
];
