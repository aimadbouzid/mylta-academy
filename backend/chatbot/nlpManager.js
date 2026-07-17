const { NlpManager } = require('node-nlp');
const trainingData = require('./trainingData');

class ChatbotManager {
  constructor() {
    this.manager = new NlpManager({ languages: ['fr', 'en', 'ar'], forceNER: true, autoSave: false });
    this.isTrained = false;
  }

  async initialize() {
    console.log('🤖 Initialisation du Chatbot IA Trilingue avec Base Massive...');

    let totalPhrases = 0;

    // ============================================
    // INJECTION DES DONNÉES D'ENTRAÎNEMENT
    // ============================================
    
    // Français
    if (trainingData.fr) {
      for (const [intent, phrases] of Object.entries(trainingData.fr)) {
        phrases.forEach(p => { this.manager.addDocument('fr', p, intent); totalPhrases++; });
      }
    }
    
    // Anglais
    if (trainingData.en) {
      for (const [intent, phrases] of Object.entries(trainingData.en)) {
        phrases.forEach(p => { this.manager.addDocument('en', p, intent); totalPhrases++; });
      }
    }

    // Arabe
    if (trainingData.ar) {
      for (const [intent, phrases] of Object.entries(trainingData.ar)) {
        phrases.forEach(p => { this.manager.addDocument('ar', p, intent); totalPhrases++; });
      }
    }

    // ============================================
    // RÉPONSES — FRANÇAIS
    // ============================================
    this.manager.addAnswer('fr', 'greetings.hello', "Salut ! 👋 Je suis l'assistant IA de Mylta Academy. Mon rôle est **uniquement** de t'aider à choisir la formation qui te correspond le mieux. Dis-moi, qu'est-ce qui t'intéresse ?");
    this.manager.addAnswer('fr', 'greetings.hello', "Bonjour ! 🎓 Je suis ici pour t'orienter vers la bonne formation. Que cherches-tu à apprendre ?");
    this.manager.addAnswer('fr', 'greetings.bye', "Merci d'avoir discuté avec moi ! Si tu as besoin d'aide pour choisir une formation, je suis toujours là. 🙏");
    this.manager.addAnswer('fr', 'identity.who', "Mylta Academy est une plateforme de formation en ligne premium 🇩🇿. Nous proposons des cours en Développement Web, Marketing Digital, Business et Design. Et moi, je suis ton assistant IA pour t'aider à choisir ! Quel domaine t'intéresse ?");
    
    // Réponses d'Orientation
    this.manager.addAnswer('fr', 'courses.guide', "Pas de panique ! 😊 Dis-moi ce qui te passionne :\n\n🖥️ **1. Développement Web** — Créer des sites et des apps\n📱 **2. Marketing Digital** — Vendre en ligne\n💼 **3. Business** — Lancer ton projet\n🎨 **4. Design** — Créer des logos et vidéos\n\nDis-moi ce qui t'attire le plus !");
    
    // Réponses par centre d'intérêt (NOUVEAU)
    this.manager.addAnswer('fr', 'interest.tech', "Puisque tu aimes la technologie et l'informatique 💻, la formation en **Développement Web** est exactement ce qu'il te faut ! Tu apprendras à créer des sites et des applications de A à Z. Ça te tente ?");
    this.manager.addAnswer('fr', 'interest.creative', "Pour un esprit créatif comme toi 🎨, je te recommande fortement notre formation en **Design** (Photoshop, Illustrator, Montage vidéo). C'est parfait pour exprimer ton talent ! Qu'en dis-tu ?");
    this.manager.addAnswer('fr', 'interest.money', "Si ton objectif principal est de générer des revenus rapidement 💸, le **Marketing Digital** (E-commerce, Ads, Dropshipping) est le domaine le plus rentable. Ça te dirait d'apprendre à vendre en ligne ?");
    this.manager.addAnswer('fr', 'interest.social', "Si tu adores les réseaux sociaux 📱, tu devrais te former en **Marketing Digital** pour devenir Community Manager ou Media Buyer. Tu pourras gérer les réseaux des entreprises et faire des pubs. C'est intéressant ?");
    this.manager.addAnswer('fr', 'interest.business_spirit', "Avec ton esprit d'entreprise 💼, notre programme **Business & Entrepreneuriat** est parfait pour toi. Tu apprendras à lancer et gérer ton propre projet. Prêt à devenir ton propre patron ?");
    
    // Réponses sur les métiers (NOUVEAU)
    this.manager.addAnswer('fr', 'career.what_is', "C'est une excellente question ! Chaque métier a ses particularités. Le Web c'est créer, le Marketing c'est vendre, le Design c'est rendre beau, et le Business c'est gérer. Lequel veux-tu que je t'explique en détail ?");
    this.manager.addAnswer('fr', 'career.salary', "Les salaires varient, mais le **Développement Web** et le **Marketing Digital** font partie des métiers les mieux payés au monde en ce moment, surtout en freelance 💰. Lequel des deux t'attire le plus ?");
    this.manager.addAnswer('fr', 'career.difficulty', "Ne t'inquiète pas pour la difficulté ! 😊 Nos formations sont faites pour les **débutants totaux** (en partant de zéro). Tout s'apprend étape par étape avec de la pratique. Tu veux commencer par quoi ?");
    this.manager.addAnswer('fr', 'career.time', "Tu avances à ton propre rythme ! ⏱️ En général, en étant sérieux, tu peux acquérir de solides compétences en 3 à 6 mois. Es-tu prêt à t'investir ?");
    this.manager.addAnswer('fr', 'compare.domains', "C'est simple : Le Web construit le produit, le Design le rend beau, le Marketing le vend, et le Business gère le tout. Si tu veux mon avis, choisis celui qui ressemble le plus à ta personnalité ! Qu'est-ce que tu aimes faire au quotidien ?");

    // Domaines spécifiques
    this.manager.addAnswer('fr', 'courses.web', "🖥️ Le **Développement Web** est LE domaine le plus demandé. Nos formations t'apprennent à créer des sites et apps. Va voir la section 'Développement Web' dans nos Formations !");
    this.manager.addAnswer('fr', 'courses.marketing', "📱 Le **Marketing Digital**, c'est le nerf de la guerre ! SEO, Facebook Ads, E-commerce, Dropshipping... Va voir la section 'Marketing' dans nos Formations !");
    this.manager.addAnswer('fr', 'courses.business', "💼 L'**Entrepreneuriat** te permet de lancer ta propre startup et de gérer tes projets de A à Z. Découvre la catégorie 'Business' !");
    this.manager.addAnswer('fr', 'courses.design', "🎨 Développe ton talent avec nos formations en **Design** : Photoshop, Illustrator, Montage vidéo. Regarde la section 'Design' !");
    
    // Admin / Pratique
    this.manager.addAnswer('fr', 'pricing.info', "💰 Les prix dépendent de la formation choisie. Consulte la page 'Formations' pour les tarifs précis. Mon rôle est de t'aider à choisir la bonne ! Quel domaine t'intéresse ?");
    this.manager.addAnswer('fr', 'payment.methods', "💳 Tu peux payer par :\n• **Virement CCP**\n• **BaridiMob**\n• **Carte Edahabia**\n\nEnvoie ton reçu et ton accès sera débloqué ! As-tu trouvé ta formation ?");
    this.manager.addAnswer('fr', 'account.register', "📝 Pour t'inscrire :\n1. Clique sur **\"S'inscrire\"** en haut à droite\n2. Remplis ton nom, email et mot de passe\n3. C'est tout ! ✅\n\nBesoin d'aide pour choisir une formation ?");
    this.manager.addAnswer('fr', 'support.contact', "🛠️ Problème technique ? Clique sur **\"Signaler\"** en haut à droite ou contacte-nous sur **WhatsApp**. Notre équipe te répondra rapidement !");
    this.manager.addAnswer('fr', 'certificate.info', "📜 Oui, tu reçois un certificat à la fin de chaque formation réussie ! Quel domaine t'intéresse ?");
    this.manager.addAnswer('fr', 'duration.info', "⏱️ Tu as accès à la formation 24h/24 et 7j/7, tu avances à ton propre rythme ! Quel domaine t'intéresse ?");
    this.manager.addAnswer('fr', 'access.info', "🔓 Pour débloquer :\n1. Choisis ta formation\n2. Paie (CCP, BaridiMob ou Edahabia)\n3. Envoie ton reçu\n4. Accès débloqué !\n\nSi déjà payé, contacte le support via \"Signaler\".");
    this.manager.addAnswer('fr', 'None', "🤔 Hmm, je ne suis pas sûr de comprendre. Mon rôle est de t'orienter vers la bonne formation (Web, Marketing, Business, Design). Dis-moi simplement ce que tu aimes faire ou ce que tu veux devenir !");

    // ============================================
    // RÉPONSES — ANGLAIS
    // ============================================
    this.manager.addAnswer('en', 'greetings.hello', "Hi there! 👋 I'm the Mylta Academy AI assistant. I'm here **only** to help you choose the right course based on what you want to learn. What interests you?");
    this.manager.addAnswer('en', 'greetings.bye', "Thanks for chatting! If you need help choosing a course, I'm always here. Good luck! 🙏");
    this.manager.addAnswer('en', 'courses.guide', "No worries! 😊 Tell me what you'd like to become:\n\n🖥️ **1. Web Development**\n📱 **2. Digital Marketing**\n💼 **3. Business**\n🎨 **4. Design**\n\nWhich one sounds like you?");
    this.manager.addAnswer('en', 'interest.tech', "Since you love tech 💻, our **Web Development** course is perfect. You'll learn to build websites from scratch. Does that sound good?");
    this.manager.addAnswer('en', 'interest.creative', "For a creative mind 🎨, I recommend our **Design** courses. You can learn Photoshop, video editing, and more. What do you think?");
    this.manager.addAnswer('en', 'interest.money', "If making money is your main goal 💸, **Digital Marketing** (E-commerce, Ads) is the fastest way. Want to learn how to sell online?");
    this.manager.addAnswer('en', 'courses.web', "🖥️ Great choice! Check out our 'Web Development' section in the courses menu.");
    this.manager.addAnswer('en', 'courses.marketing', "📱 **Digital Marketing** is where the money is! Check out our 'Marketing' courses.");
    this.manager.addAnswer('en', 'courses.business', "💼 You've got an entrepreneurial spirit! Check out the 'Business' category.");
    this.manager.addAnswer('en', 'courses.design', "🎨 Creative profile! Check out the 'Design' section.");
    this.manager.addAnswer('en', 'pricing.info', "💰 Prices depend on the course. Check the 'Courses' page. What field interests you?");
    this.manager.addAnswer('en', 'payment.methods', "💳 You can pay via CCP, BaridiMob or Edahabia. Just send your receipt to unlock access!");
    this.manager.addAnswer('en', 'account.register', "📝 Click 'Sign Up' at the top right to create your account.");
    this.manager.addAnswer('en', 'support.contact', "🛠️ Technical issue? Click 'Report' at the top right.");
    this.manager.addAnswer('en', 'None', "🤔 I didn't quite catch that. I'm here to help you choose a course. What do you like doing?");

    // ============================================
    // RÉPONSES — ARABE
    // ============================================
    this.manager.addAnswer('ar', 'greetings.hello', "أهلاً! 👋 أنا المساعد الذكي لميلتا أكاديمي. دوري هو مساعدتك في اختيار التكوين المناسب لك. قل لي، ما الذي يهمك؟");
    this.manager.addAnswer('ar', 'greetings.bye', "شكراً على المحادثة! بالتوفيق! 🙏");
    this.manager.addAnswer('ar', 'courses.guide', "لا تقلق! 😊 أخبرني ماذا تريد أن تصبح:\n\n🖥️ **1. تطوير الويب**\n📱 **2. التسويق الرقمي**\n💼 **3. ريادة الأعمال**\n🎨 **4. التصميم**\n\nأي مجال يناسبك؟");
    this.manager.addAnswer('ar', 'interest.tech', "بما أنك تحب التقنية 💻، دورة **تطوير الويب** هي الأنسب لك! ستتعلم برمجة المواقع من الصفر. هل هذا يعجبك؟");
    this.manager.addAnswer('ar', 'interest.creative', "لشخص مبدع مثلك 🎨، أنصحك بدورات **التصميم** (فوتوشوب، مونتاج). ما رأيك؟");
    this.manager.addAnswer('ar', 'interest.money', "إذا كان هدفك كسب المال 💸، فمجال **التسويق الرقمي** (التجارة الإلكترونية) هو الأفضل. هل تريد تعلم البيع أونلاين؟");
    this.manager.addAnswer('ar', 'courses.web', "🖥️ اختيار ممتاز! شاهد قسم 'تطوير الويب' في التكوينات.");
    this.manager.addAnswer('ar', 'courses.marketing', "📱 **التسويق الرقمي** هو مفتاح النجاح! شاهد قسم 'التسويق' في دوراتنا.");
    this.manager.addAnswer('ar', 'courses.business', "💼 اكتشف فئة 'ريادة الأعمال' لإطلاق مشروعك الخاص!");
    this.manager.addAnswer('ar', 'courses.design', "🎨 طور مهاراتك مع دوراتنا في 'التصميم'!");
    this.manager.addAnswer('ar', 'pricing.info', "💰 الأسعار تختلف حسب الدورة. زر صفحة 'التكوينات'. أي مجال يهمك؟");
    this.manager.addAnswer('ar', 'payment.methods', "💳 يمكنك الدفع عبر CCP، بريدي موب، أو الذهبية.");
    this.manager.addAnswer('ar', 'account.register', "📝 اضغط على 'التسجيل' في الأعلى لإنشاء حسابك.");
    this.manager.addAnswer('ar', 'support.contact', "🛠️ عندك مشكلة؟ اضغط على 'إبلاغ' في الأعلى.");
    this.manager.addAnswer('ar', 'None', "🤔 لم أفهم جيداً. أنا هنا لمساعدتك في اختيار دورتك. أخبرني ماذا تحب أن تتعلم!");

    // ============================================
    // ENTRAÎNEMENT
    // ============================================
    await this.manager.train();
    this.isTrained = true;
    console.log(`✅ Chatbot IA Trilingue entraîné avec succès (${totalPhrases} phrases chargées depuis la base massive) !`);
  }

  async processMessage(message) {
    if (!this.isTrained) {
      return "L'assistant démarre, merci de patienter... / The assistant is starting...";
    }

    try {
      const response = await this.manager.process(message);
      
      // Si le bot n'est pas sûr, on donne la réponse par défaut selon la langue
      if (response.intent === 'None' || response.score < 0.5) {
        if (response.answer) return response.answer;
        if (response.locale === 'en') return "🤔 I didn't understand. Tell me what you want to learn!";
        if (response.locale === 'ar') return "🤔 لم أفهم. ماذا تريد أن تتعلم؟";
        return "🤔 Je n'ai pas compris. Je suis ici pour t'aider à choisir ta formation. Que veux-tu apprendre ?";
      }

      return response.answer;
    } catch (error) {
      console.error("Erreur NLP:", error);
      return "Oups, j'ai eu un petit bug. Peux-tu reformuler ?";
    }
  }
}

const nlpManager = new ChatbotManager();
module.exports = nlpManager;
