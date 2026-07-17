// ============================================================
// BASE DE DONNÉES D'ENTRAÎNEMENT GIGANTESQUE — CHATBOT IA
// Mylta Academy — Trilingue (FR / EN / AR)
// Version : Ultra Massive
// ============================================================

module.exports = {

  // ============================================================
  // FRANÇAIS ET DARJA ALGÉRIENNE — DICTIONNAIRE GIGANTESQUE
  // ============================================================
  fr: {

    // ─── SALUTATIONS ───────────────────────────────────────
    'greetings.hello': [
      'bonjour','salut','coucou','salam','wesh','bonsoir','bjr','slt','cc','yo','hello','hi','hey',
      'salam aleykoum','salam alikoum','ahlan','marhaba','salutations','bon matin','rebonjour',
      'salut l equipe','bonjour mylta','hello mylta','salam khouya','salam khti','salam khawti',
      'bsr','cv','ça va','sava','ca va','bien ou bien','labas','la bas','wach rak','wach raki',
      'bonsoir a tous','salut a tous','bonjour a vous','salut tout le monde','coucou tout le monde',
      'alo','allo','merci','chokran','choukran','barakallah','barakallahou fik',
      'salam 3alaykom','salem','slm','slam','ssalam','salam alikom',
      'bjour','bnsr','bnjr','bnjour','bonjourr','saluttt','salutt','cccc','coucouuu',
      'hola','yoo','yooo','heyy','heyyy','sahit','sahitou','saha','sahite',
      'nahar said','sbah el khir','sbah lkhir','sbah nour','msa lkhir','masa lkhir',
      'wa3likom salam','wa alaykum assalam', 'kif halek', 'wach hwalek', 'kifech rakom',
      'bonjour comment ca va', 'salut ca va', 'salam labas', 'salut mylta', 'hey la team',
      'coucou l equipe', 'salam tout le monde', 'salut les gars', 'yo la team', 'bonjour monsieur'
    ],

    'greetings.bye': [
      'au revoir','bye','bye bye','a bientot','a plus','ciao','tchao',
      'bonne journee','bonne soiree','bonne nuit','a demain','a la prochaine',
      'saha','tsbah 3la khir','allah yhafdak','allah y7afdek','ya3tik saha',
      'merci beaucoup','merci bcp','mrc','merci bien','merci infiniment','chokran bazaf',
      'ok merci','ok mrc','d accord merci','compris merci','c noté merci',
      'c bon merci','parfait merci','super merci','genial merci','top merci',
      'allah yahafdek','rabi yahafdek','rabi y7afdek','rabi ybarek','rabi ywaf9ak',
      'saha khouya', 'saha khti', 'merci pour l info', 'merci pour le conseil',
      'au revoir merci', 'bye merci', 'a plus tard', 'je vous laisse', 'bonne continuation'
    ],

    // ─── IDENTITÉ / C'EST QUOI MYLTA ─────────────────────
    'identity.who': [
      'qui es tu','c est quoi','tu es qui','qui etes vous','t es qui','tes ki',
      'c koi mylta','c quoi mylta','c est quoi mylta academy','c est quoi cette plateforme',
      'presentez vous','presente toi','c est quoi ce site','expliquer moi',
      'wach hada','chnou hadi','chnou hada','achnou hadi','wesh hada',
      'c est quoi votre site','a quoi sert ce site','pourquoi ce site','but du site',
      'comment ca marche','kifach khadma','kifash khedma','comment fonctionne',
      'que faites vous','vous faites quoi','ton role c est quoi','c est quoi ton but',
      'tu fais quoi','tu sert a quoi','a quoi tu sert','c est quoi l objectif',
      'wach dir','wach tdir','chkoun ntouma','chkoun enta','ntouma chkoun',
      'vous etes qui', 'c est quoi cette ecole', 'c est une ecole ?', 'vous proposez quoi',
      'chwya info', 'les informations stp', 'donne moi des infos sur vous'
    ],

    // ─── ORIENTATION / GUIDE GÉNÉRAL / DOUTES (TRÈS MASSIF) ────────────
    'courses.guide': [
      'je ne sais pas quoi faire','je c pas koi faire','quoi etudier','koi etudier','aide moi a choisir',
      'je suis perdu','tu me conseil quoi','donne moi un cour','quel formation choisir','kifach nkhtar',
      'aide moi','help','je veux me former','je veux apprendre','par ou commencer','wach nakra',
      'wach ndir','kifach nabda','debutant','je suis debutant','orienter moi','orientation',
      'conseil moi','aidez moi svp','jsais pas','jsp','je doute','quel domaine choisir',
      'meilleur domaine','le plus demandé','lequel choisir','je cherche une formation',
      'je cherche un metier','reconversion','changer de metier','nouveau depart',
      'quoi apprendre','apprendre un truc','comment choisir','je sais plus quoi faire',
      'kel formation','kelle formation','formassion','consseille moi','conseye moi',
      'chui perdu','chu perdu','je sui perdu','perdu','aide','aider moi','ede moi',
      'je veu apprendre','je veu me former','je ve apprendre','je vx apprendre',
      'comencer','commencer par quoi','je debute','c quoi le mieu','c koi le mieux',
      'wach nkhdem','wach nta3lem','nta3lem','nabda mnen','men win nabda','mnin nabda',
      'wach fih mustaqbal','mustaqbal','avenir','quel avenir','meilleur metier',
      'besoin aide','besoin d aide','j ai besoin d aide','jai besoin daide',
      'guidez moi','guide moi','je veux reussir','je veux un travail','je veux une carriere',
      'trouver un emploi','emploi','travail','khdma','khedma','khadma',
      'je veux changer ma vie','changer de vie','developper mes competences',
      'skills','nlawej 3la formation','bghit formation','bghit nta3lem',
      'baghi nta3lem','nhab nta3lem','brit formation','rani tayaht',
      'je sais pas quoi etudier aide moi','j hesite entre plusieurs domaines',
      'dis moi quoi faire de ma vie','oriente moi vers le bon domaine',
      'je cherche quelque chose a apprendre','c est quoi le meilleur pour moi',
      'tu peux m aider a trouver ma voie','quelle est la meilleure formation pour un debutant',
      'je veux apprendre un metier d avenir','quel est le domaine le plus rentable',
      'je veux gagner ma vie avec internet','comment trouver ma passion',
      'j ai 18 ans quoi faire','j ai 20 ans et je sais pas quoi etudier',
      'j ai 25 ans reconversion','j ai 30 ans je veux changer de metier',
      'j ai 40 ans que faire','il n est jamais trop tard pour apprendre',
      'j ai pas de diplome','sans diplome que faire','sans bac','pas de bac',
      'je n ai pas eu mon bac','je n ai pas le bac', 'pas de diplome c est grave',
      'je veux travailler en ligne','je veux un travail en ligne',
      'wach kayn li ykhales','wach kayn li fih flous','wach kayn mustaqbal',
      'nbghi haja fiha flous','haja mliha','haja bekri','haja sahla','haja matalba',
      'je m ennuie dans ma vie', 'je veux avancer', 'je veux faire quelque chose de ma vie',
      'je suis au chomage', 'chomeur', 'pas de travail', 'je trouve pas de travail',
      'je veux lancer ma carriere', 'orientez moi svp', 'oriente moi'
    ],

    // ─── INTÉRÊTS SPÉCIFIQUES POUR GUIDER L'UTILISATEUR ────────────────────────
    'interest.tech': [
      'j aime la technologie','j aime la tech','j adore la techno','j aime les ordinateurs',
      'je suis passionné par l informatique','j aime l informatique','la tech me passionne',
      'je kiffe les ordi','j adore les ecrans','j aime les gadgets','la technologie me plait',
      'j aime les machines','j aime les robots','j aime l intelligence artificielle',
      'j aime l ia','j aime la science','geek','je suis geek','nerd','je suis nerd',
      'j aime reparer les ordis','j aime demonter les trucs','j aime comprendre comment ca marche',
      'j aime les jeux video et je veux en creer','j aime les nouvelles technologies',
      'nhab la tech','nhab informatique','nhab les ordi','nhab technologie',
      'bghit haja fiha tech','bghit nkhdem f tech','bghit nkhdem f informatique',
      'j aime la programmation','je passe mon temps sur pc','j aime les logiciels',
      'informatique c est ma passion','ordinateur', 'j aime taper au clavier'
    ],

    'interest.creative': [
      'j aime dessiner','j aime le dessin','j aime creer des choses','je suis creatif',
      'j aime l art','j adore l art','j aime la creation','j aime les couleurs',
      'j aime faire des videos','j aime les photos','j aime la photographie',
      'j aime le montage','j adore monter des videos','je kiffe les visuels',
      'j aime les belles choses','j aime les trucs esthetiques','j aime decorer',
      'j aime peindre','j aime le cinema','j aime les films','j aime les animations',
      'j aime les effets speciaux','j aime creer des contenus visuels',
      'j aime retoucher les photos','je suis artistique','j ai un talent artistique',
      'nhab nrsem','nhab dessin','nhab les couleurs','nhab l art',
      'bghit haja fiha creation','bghit ndir des trucs beaux','nhab le montage',
      'nhab ndir videos','nhab photographie','nhab tswir','nhab design',
      'je suis imaginatif', 'j ai beaucoup d imagination', 'j aime inventer'
    ],

    'interest.money': [
      'je veux gagner de l argent','je veux faire de l argent','je veux devenir riche',
      'je veux l argent','comment gagner argent','comment faire de l argent',
      'je veux gagner beaucoup','je veux un bon salaire','je veux bien gagner ma vie',
      'argent','fric','thunes','je veux les sous','je veux de la money',
      'je veux devenir millionnaire','je veux etre independant financierement',
      'liberte financiere','independance financiere','revenus passifs',
      'je veux un revenu en ligne','je veux gagner sur internet',
      'gagner argent rapidement','argent facile','argent rapide',
      'bghit flous','bghit drahem','bghit ndir flous','bghit nrbah','nrbah drahem',
      'kifach nrbah','kifach ndir flouss','bghit masari','nhab nrbah flous',
      'wach kayn haja fiha flous','haja fiha bezaf flous','nrbah online','drahem bezaf',
      'quel metier rend riche', 'je veux acheter une voiture', 'je veux acheter une maison'
    ],

    'interest.social': [
      'j aime les reseaux sociaux','j aime facebook','j aime instagram','j aime tiktok',
      'je passe mon temps sur les reseaux','je suis tout le temps sur insta',
      'j aime poster des trucs','j aime les likes','j aime creer du contenu',
      'j aime parler aux gens','j aime communiquer','j aime le contact humain',
      'j aime les relations','j aime convaincre','j aime negocier','j aime discuter',
      'j aime la communication','j aime influencer les gens','j aime motiver les gens',
      'nhab social media','nhab facebook','nhab insta','nhab tiktok',
      'nhab ndir contenu','nhab les reseaux','dima f telephone',
      'dima f les reseaux','ana dima online','nhab ncommuniquer','j aime faire des videos tiktok',
      'je veux etre influenceur', 'je veux etre connu', 'j aime la notoriete'
    ],

    'interest.business_spirit': [
      'j aime les affaires','j aime le commerce','j ai des idees de projet',
      'j aime vendre','j aime acheter et revendre','j aime le business',
      'j aime l argent et les affaires','j aime diriger','j aime gerer',
      'j aime organiser','j aime planifier','j aime les strategies',
      'j aime commander','j aime etre le chef','j aime prendre des decisions',
      'j ai toujours voulu avoir mon entreprise','j ai un projet en tete',
      'j ai une idee de business','j ai une idee de startup',
      'j aime le leadership','j aime manager les gens','j aime les challenges',
      'nhab commerce','nhab tijara','nhab nbi3','nhab les affaires',
      'nhab ndir haja ta3i','3andi fikra','3andi projet','3andi idee',
      'bghit nkoun patron','bghit nkoun le chef','bghit ndebber rassi',
      'je veux lancer un produit', 'je veux vendre des trucs', 'commerce en ligne'
    ],

    // ─── QUESTIONS SUR LA DIFFICULTÉ ET LE TEMPS ──────────
    'career.difficulty': [
      'c est dur','c est difficile','c est facile','c est compliqué',
      'le dev c est dur','le marketing c est dur','le design c est dur',
      'est ce que c est facile','est ce accessible','tout le monde peut apprendre',
      'faut etre intelligent','il faut un diplome','sans diplome c est possible',
      'wach sahla','wach s3iba','sahla wella s3iba','facile ou difficile',
      'je suis nul en maths','je suis nul en informatique','j ai peur de pas y arriver',
      'j ai peur d echouer','est ce que je peux reussir','meme si je suis nul',
      'je n ai aucune experience','zero experience','j ai jamais codé',
      'j ai jamais fait de design','j ai jamais vendu','debutant total',
      'wach nqder','wach nqder nta3lemha','mazal ma3andi experience',
      'est ce que n importe qui peut reussir', 'j ai un niveau faible',
      'je parle pas bien francais', 'je parle pas anglais', 'c est en arabe ?'
    ],

    'career.time': [
      'combien de temps pour devenir dev','combien de temps pour apprendre le code',
      'combien de temps pour le marketing','combien de temps pour le design',
      'en combien de temps je peux travailler','quand est ce que je serai pret',
      'ca prend combien de temps','c est long','ca va etre rapide',
      'je peux apprendre en 1 mois','je peux apprendre en 3 mois',
      'je peux apprendre en 6 mois','formation acceleree','formation rapide',
      'formation intensive','chhal mn wa9t bch nwali dev','chhal mn wa9t bch nta3lem',
      'en combien de jours', 'je suis pressé', 'je veux apprendre vite'
    ],

    // ─── COMPARAISONS ──────────────────────
    'compare.domains': [
      'web ou marketing','marketing ou web','dev ou design','design ou dev',
      'business ou marketing','marketing ou business','web ou design',
      'quel est le meilleur','lequel est mieux','quel domaine est le meilleur',
      'quel est le plus facile','quel est le plus dur','quel est le plus rentable',
      'je hesite entre le dev et le marketing','je hesite entre le design et le web',
      'je hesite entre le business et le marketing',
      'web wella marketing','design wella dev','business wella marketing',
      'wach khir dev wella marketing','wach khir design wella dev',
      'la difference entre web et marketing','c est quoi la difference',
      'avantages du dev','avantages du marketing','avantages du design','avantages du business'
    ],

    // ─── DÉVELOPPEMENT WEB (TRÈS MASSIF) ──────────────────────
    'courses.web': [
      'developpement web','developpeur','programmation','site web','site internet','application mobile',
      'application web','backend','frontend','fullstack','react','javascript','html','css','php',
      'python','node','creer site','creer une application','logiciel','coder','codeur',
      'formation web','develepment','devlopmen','dev web','dev','programer','koder',
      'cit web','sit web','aplication','devlopeur','devloppeur','programeur','creer sit',
      'faire un site','faire une app','programation','informatique','devlopper','codage',
      'je veux apprendre a coder','je veux faire des sites','apprendre la programmation',
      'je veux etre dev','formation programmation','apprendre le code','je veux developper',
      'angular','vue','vuejs','reactjs','nodejs','express','django','flask','laravel',
      'wordpress','java','c sharp','swift','kotlin','flutter','dart','typescript',
      'sql','mysql','mongodb','base de données','bdd','api','rest api',
      'kodage','koding','coding','code','programmer','programe','programm',
      'sit internt','sit intirnet','appli mobile','app mobile','application tel',
      'web developer','devenir developpeur','full stack','fulstack',
      'je veu coder','apprendre coder','aprendre code','creer aplication',
      'apprendre python','apprendre javascript','apprendre java','apprendre react',
      'apprendre html','apprendre css','apprendre php','informatik','informatiq',
      'ndir sit','nsaweb sit','nbni site','bghit nta3lem code','nbghi informatique',
      'creer une boutique shopify','creer un blog','creer un portfolio','creer un forum',
      'faire un jeu video','game dev','jeux video','unity','unreal engine',
      'cybersecurite','securite informatique','hacking ethique','ethical hacking',
      'data science','science des donnees','big data','machine learning',
      'devops','cloud','aws','azure','google cloud','docker','kubernetes',
      'blockchain','crypto','web3','smart contract','solidity',
      'intelligence artificielle','ia','ai','chatbot','automatisation',
      'linux','serveur','hebergement','deploiement','hosting',
      'je veux etre hacker', 'comment pirater', 'je veux creer des applications iphone',
      'apprendre react native', 'je veux creer facebook', 'je veux developper mon propre jeu'
    ],

    // ─── MARKETING DIGITAL (TRÈS MASSIF) ─────────────────────
    'courses.marketing': [
      'marketing','marketing digital','e-commerce','ecommerce','seo','reseaux sociaux','publicite',
      'facebook ads','instagram ads','tiktok ads','influenceur','community manager','referencement',
      'dropshipping','vendre en ligne','boutique en ligne','shopify','social media','cm',
      'marketin','markiting','icommerce','ecom','e commerce','pub facebook','pub insta',
      'drop','dropshiping','marketeur','vendeur','vendre sur internet',
      'pub','publiciter','sponso','sponsorisation',
      'je veux vendre','apprendre a vendre','faire de la pub','comment vendre',
      'creer une boutique','faire du ecommerce','gerer des pages','devenir cm',
      'pub sur facebook','pub sur tiktok','google ads',
      'facebook marketing','instagram marketing','youtube marketing',
      'social media manager','smm','sem','sea',
      'affiliate marketing','affiliation','emailing','email marketing','newsletter',
      'content marketing','creation de contenu','influencer','influenseur',
      'rasso sociaux','resaux','reseau social',
      'facebook','instagram','tiktok','youtube','linkedin','snapchat','snap',
      'vendre','commerce en ligne','vente','boutik','shop','store',
      'dropshipin','drop shiping','dropsipping','droppshipping',
      'gagner de l argent en ligne','argent en ligne','travail en ligne','freelance',
      'freelancer','frilance','pigiste',
      'nbi3','nbi3 en ligne','commerce','tijara','tidjara',
      'nbigh f internet','nbi3 f internet','bghit nbi3','brit nbi3','nhab nbi3',
      'kifach nbi3','kifach nbi3 en ligne','page facebook','creer page facebook',
      'gerer page facebook','page insta','gerer page instagram',
      'copywriting','ecriture persuasive','redaction web','growth hacking','funnel',
      'tunnel de vente','landing page','page de vente','conversion',
      'retargeting','remarketing','pixel facebook','tracking','analytics',
      'google analytics','google search console','strategie de contenu',
      'calendrier editorial','planning reseaux sociaux','engagement',
      'taux de conversion','roi','retour sur investissement',
      'marketplace','amazon fba','print on demand','pod','etsy',
      'personal branding','marque personnelle','image de marque',
      'comment avoir des abonnes', 'comment percer sur tiktok', 'comment faire des vues',
      'comment etre celebre sur internet', 'je veux vendre des vetements en ligne',
      'je veux faire du dropshipping'
    ],

    // ─── BUSINESS / ENTREPRENEURIAT (TRÈS MASSIF) ─────────────
    'courses.business': [
      'business','entrepreneuriat','entrepreneur','startup','management','gestion','commerce',
      'projet','leader','leadership','creer une entreprise','gerer un projet','investir',
      'faire de l argent','gagner argent','devenir riche','monter sa boite',
      'bizness','bzns','bzzness','start up','startp','antrepreneur','entreprenariat',
      'managment','bisnes','bisness','business en ligne','busines','bznss',
      'creer entreprise','idee de projet','lancer projet','faire largent',
      'business man','business woman',
      'je veux creer mon entreprise','je veux me lancer','comment faire un projet',
      'gerer mon entreprise','devenir independant','gagner ma vie','lancer mon affaire',
      'patron','devenir patron','mon propre patron','auto entrepreneur',
      'micro entreprise','a mon compte','lancer ma boite','ma societe',
      'investissement','business plan','bizness plan','plan d affaire',
      'comptabilite','finance','strategie','negociation','negocier',
      'technique de vente','closing','import export',
      'buisness','buisnes','busns','entrapreneur','entrepreunur',
      'ndir projet','ndir business','nbda business','nkhdm wahdi',
      'nkhdem rassi','bghit nkhdem rassi','bghit ndir projet','brit ndir projet',
      'nhab ndir business','business dz',
      'mashrou3','machrou3','projet ta3i','ndebber rassi','nkhdm 3la rasi',
      'franchise','franchiser','ouvrir une franchise','registre de commerce','rc',
      'sarl','eurl','auto entrepreneur algerie','micro entreprise algerie',
      'fiscalite','impots','taxes','comptable','expert comptable',
      'levee de fonds','financement','crowdfunding','business angel','investisseur',
      'pitch','pitcher','presentation investisseur','elevator pitch',
      'etude de marche','analyse de marche','concurrence','benchmark',
      'strategie commerciale','plan commercial','objectifs','kpi',
      'ressources humaines','rh','recrutement','embaucher','equipe',
      'productivite','efficacite','gestion du temps','time management',
      'comment devenir riche', 'comment investir', 'ou investir mon argent',
      'comment reussir dans la vie', 'livre pere riche pere pauvre'
    ],

    // ─── DESIGN / GRAPHISME (TRÈS MASSIF) ─────────────────────
    'courses.design': [
      'design','designer','graphisme','photoshop','illustrator','figma','ui','ux','logo',
      'visuel','affiche','flyer','retouche photo','montage video','premiere pro','after effects',
      'createur','canva','ui ux','web design','infographie','infographiste',
      'desin','dezign','dizain','graphic','graphique','fotoshop','fotoshoppe','ilustrator',
      'faire un logo','creer logo','design graphique','video','montage',
      'monteur','retoucher','dessin','grafisme','grafiste',
      'je veux faire des designs','je veux devenir designer','apprendre photoshop',
      'faire du montage','creer des visuels','comment faire un logo',
      'motion design','motion graphic','animation','3d','blender',
      'cinema 4d','montage vidéo','monter des videos','editeur video',
      'premiere','final cut','davinci','capcut','cap cut',
      'miniature youtube','thumbnail','poster','banniere','carte visite',
      'identite visuelle','branding','photographe','photo',
      'retouche','lightroom','ps','ai','ae','pr',
      'deziner','disigner','graphist','grafist',
      'photoshope','fotochop','ilistrator',
      'ui design','ux design','prototype','maquette','mockup','wireframe',
      'ndir logo','ndir design','ndir montaj','bghit design',
      'bghit nta3lem photoshop','nhab design','nta3lem photoshop','nta3lem design',
      'typographie','typo','mise en page','layout','charte graphique',
      'palette de couleurs','theorie des couleurs','composition','cadrage',
      'retouche beaute','retouche mode','retouche publicitaire','packshot',
      'emballage','packaging','design packaging','design produit',
      'motion 2d','motion 3d','animation 2d','animation 3d',
      'vfx','effets visuels','compositing','tracking video',
      'sound design','design sonore','voice over','narration',
      'storyboard','scenario','script video','scenario publicitaire',
      'je veux faire des miniatures pour youtube', 'creer des flyers', 'je veux devenir monteur',
      'comment faire du montage pour tiktok'
    ],

    // ─── PRIX / TARIFS ──────────────────────────────────
    'pricing.info': [
      'combien','combien ça coûte','c koi le prix','chkhal','bchhal','c gratuit','gratuit',
      'prix','tarif','tarifs','payant','flouss','drahem','souma','budget',
      'c est a combien','le prix stp','chkhal draham','ch7al','chhal','chhal souma',
      'es que c est gratuit','les prix','combient','combiens',
      'prix formation','prix des formations','formation gratuite','formations gratuites',
      'wach gratuit','machi gratuit','faut payer combien','ca coute combien',
      'prix du cours','tarif formation','gratuis','gratu',
      'free','mjaani','mjani','belash','blach','bla flous','bla drahem',
      'masari','flous','flousse','cher','trop cher','ghali','pas cher','rkhis',
      'reduction','promo','promotion','remise','code promo','solde',
      'offre','offre speciale','takhfid','takhfidat',
      'wach kayn promo','combien je dois payer','nkhalas chhal','chhal nkhalas',
      'le montant','montant','facture','devis',
      'est ce que c est cher', 'avez vous des facilites de paiement',
      'payer en plusieurs fois', 'paiement par tranche'
    ],

    // ─── PAIEMENT ───────────────────────────────────────
    'payment.methods': [
      'comment payer','ccp','baridimob','moyen de paiement','kifach nkhalas','payer','paye',
      'paiement','poste','baridi mob','edahabia','carte en or','carte gold','virement',
      'compte ccp','virement postal','comment envoyer l argent','comment regler',
      'paiement ccp','cib','carte bancaire','payment',
      'payer par ccp','payer par baridimob','payer par edahabia','payer par virement',
      'comment je paye','kifash nkhalas','kifach ndfa3','ndfa3','nkhales','khalas',
      'baridi','barid mob','bardimob','baridi mobe',
      'edahabiya','dahbia','dahabiya','carte dahbia','carte dahabia','golden card',
      'recu','reçu','envoyer recu','recu de paiement','justificatif',
      'preuve de paiement','j ai paye','jai payé','deja payer',
      'virement bancaire','transfert','transfert argent',
      'hwala','tahwil','tahwila','transferer',
      'kifach nsifet flouss','nsift flouss','nsift lflous',
      'wach nkhales b ccp','wach nkhales b baridimob','nkhales b edahabia',
      'rib', 'rip', 'numero de compte', 'compte bancaire', 'badr', 'cpa', 'bna'
    ]
  },

  // ============================================================
  // ANGLAIS — DICTIONNAIRE MASSIF
  // ============================================================
  en: {

    'greetings.hello': [
      'hello','hi','hey','good morning','good afternoon','good evening','howdy',
      'sup','whats up','what\'s up','yo','greetings','hi there','hello there',
      'hey there','hi mylta','hello mylta','good day','hiya','heya',
      'how are you','how r u','hru','how u doing','wassup','wazzup'
    ],

    'courses.guide': [
      'i don\'t know what to do','i dont know what to do','idk what to do','what should i study',
      'help me choose','i am lost','i\'m lost','what do you recommend','recommend me a course',
      'what course should i take','which course','which formation','guide me',
      'help me','i want to learn','i wanna learn','where do i start','beginner',
      'i am a beginner','im a beginner','advise me','advice','suggest',
      'best course','best domain','most demanded','career advice','what to learn',
      'looking for a course','looking for training','need help choosing',
      'i need guidance','what skills','what skill to learn','change career',
      'new career','improve skills','upskill','new skill',
      'i dont know what to study','what should i learn','confused','need direction',
      'not sure what to pick','can you help me decide','point me in the right direction',
      'what is the best field','most in demand','highest paying field',
      'i want a new career','career change','switch careers','start fresh',
      'i have no experience','no experience','total beginner','complete beginner',
      'zero knowledge','fresh start','starting from scratch','from zero'
    ],

    'interest.tech': [
      'i love technology','i love tech','i like computers','i like gadgets',
      'i am passionate about technology','tech interests me','i like tinkering',
      'i like fixing things','i like understanding how things work',
      'i want to create software','i love gaming and want to make games',
      'i am a geek','i am a nerd','i love science','i love ai',
      'i love robots','i love automation','i like machines','tech is my thing'
    ],

    'courses.web': [
      'web development','developer','programming','website','web app','mobile app',
      'backend','frontend','fullstack','full stack','react','javascript','html','css',
      'php','python','node','nodejs','create website','build website','software',
      'coding','coder','programmer','code','learn to code','learn coding',
      'web dev','dev','angular','vue','vuejs','express','django','laravel',
      'wordpress','java','c sharp','swift','kotlin','flutter','typescript',
      'sql','mysql','mongodb','database','api','rest api',
      'i want to code','i want to build websites','become a developer','learn programming',
      'learn web development','software development','software engineering',
      'learn python','learn javascript','learn java','learn react','learn html',
      'it','computer science','cs','tech','technology',
      'game development','game dev','cybersecurity','data science','machine learning',
      'devops','cloud computing','blockchain','web3','ai'
    ],
    
    // (We keep the rest of english minimal since target is mostly FR/AR, but we add all core intents)
    'pricing.info': [
      'how much','how much does it cost','price','pricing','cost','fee','fees',
      'is it free','free','paid','expensive','cheap','affordable',
      'what is the price','course price','subscription',
      'discount','promo','promotion','coupon','sale','offer','special offer',
      'how much do i pay','total cost','budget','money'
    ]
  },

  // ============================================================
  // ARABE — DICTIONNAIRE MASSIF
  // ============================================================
  ar: {

    'greetings.hello': [
      'مرحبا','أهلا','السلام عليكم','سلام','صباح الخير','مساء الخير','هلا',
      'أهلا وسهلا','مرحبا بك','كيف حالك','كيفك','شلونك','كيف الحال',
      'يا هلا','هلا والله','حياك الله','الله يحييك','تحية طيبة',
      'صباح النور','مساء النور','السلام عليكم ورحمة الله','وعليكم السلام',
      'اهلا','مرحبا بكم','سلام عليكم','اهلين'
    ],

    'courses.guide': [
      'ما أعرف شو أسوي','ما اعرف شو ادرس','ايش ادرس','ايش اتعلم','ساعدني أختار',
      'ساعدني اختار','أنا ضايع','انا ضايع','انا حائر','وش تنصحني','انصحني',
      'ابي اتعلم','ابغى اتعلم','من وين أبدأ','من وين ابدا','مبتدئ','أنا مبتدئ',
      'ايش أفضل مجال','ايش افضل تخصص','أفضل دورة','افضل كورس',
      'أبي دورة','ابغى دورة','ابي كورس','وجهني','دلني','ارشدني',
      'اريد ان اتعلم','أريد أن أتعلم','ماذا أدرس','ماذا أتعلم',
      'ما هو أفضل تخصص','أفضل مجال','مجال المستقبل','مستقبل',
      'تغيير مهنة','مهارات جديدة','تطوير نفسي','تطوير مهاراتي',
      'ابي شي مطلوب','ايش المطلوب','وش المطلوب في السوق',
      'محتار','محتارة','ما ادري وش اسوي','ما ادري وش ادرس',
      'ابي اغير حياتي','اغير حياتي','حياة جديدة','بداية جديدة',
      'ما عندي خبرة','بدون خبرة','من الصفر','ابدأ من الصفر',
      'ايش الشي اللي يجيب فلوس','ايش اكثر شي مطلوب','اكثر مجال مطلوب'
    ],

    'courses.web': [
      'تطوير ويب','تطوير مواقع','تطوير تطبيقات','برمجة','مبرمج','مطور',
      'موقع','موقع ويب','موقع انترنت','تطبيق','تطبيق جوال','تطبيق موبايل',
      'كود','كودينغ','أكواد','اكواد','تعلم البرمجة','اتعلم برمجة',
      'ابي اتعلم برمجة','بايثون','جافا','جافاسكريبت','ريأكت','فلاتر',
      'فرونت اند','باك اند','فل ستاك','قواعد بيانات','سيكول',
      'اريد ان اصنع موقع','ابي اسوي موقع','ابي اسوي تطبيق','صناعة المواقع',
      'تصميم مواقع','انشاء موقع','بناء موقع','بناء تطبيق','معلوماتية',
      'حاسوب','كمبيوتر','تقنية','تكنولوجيا','اي تي','علوم حاسب',
      'ابغى اتعلم كود','ابي اكود','ابي اصير مبرمج','ابي اصير مطور',
      'تطوير العاب','صناعة العاب','امن سيبراني','علم بيانات','ذكاء اصطناعي'
    ],

    'pricing.info': [
      'كم','كم السعر','بكم','كم يكلف','السعر','سعر','اسعار','أسعار',
      'مجاني','هل مجاني','مدفوع','غالي','رخيص','فلوس','مصاري',
      'ميزانية','كم أدفع','كم ادفع','المبلغ','تخفيض','عرض','خصم',
      'كود خصم','بروموشن','تنزيلات','كم الرسوم','كم الاشتراك',
      'هل في خصم','هل في تخفيض','هل فيه عرض'
    ]
  }
};
