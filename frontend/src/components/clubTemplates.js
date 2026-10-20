// Modèles d'événements proposés aux organisateurs. Partir d'une page blanche
// est la première raison pour laquelle un événement n'est jamais créé : on
// propose donc des formats courants, déjà remplis, qu'il reste à ajuster.
//
// Les horaires sont des exemples réalistes pour un campus : début en milieu
// de matinée, pause déjeuner respectée, fin avant les derniers transports.

export const EVENT_TEMPLATES = [
  {
    id: 'open-day',
    kind: 'open-day',
    label: 'Open day',
    hint: 'Une journée portes ouvertes pour faire découvrir le club.',
    title: 'Open day du club scientifique',
    summary: 'Une journée pour découvrir le club, ses activités et rencontrer ses membres.',
    startTime: '09:00',
    endTime: '16:00',
    programme: [
      { time: '09:00', label: 'Accueil et café' },
      { time: '10:00', label: 'Présentation du club et de ses activités' },
      { time: '11:00', label: 'Ateliers de découverte' },
      { time: '13:00', label: 'Pause déjeuner' },
      { time: '14:00', label: 'Démonstrations et projets des membres' },
      { time: '15:30', label: 'Questions, inscriptions et clôture' },
    ],
  },
  {
    id: 'conference',
    kind: 'conference',
    label: 'Conférence',
    hint: 'Un intervenant, un sujet, des questions de la salle.',
    title: 'Conférence : ',
    summary: 'Une rencontre avec un intervenant du secteur, suivie de questions.',
    startTime: '14:00',
    endTime: '16:30',
    programme: [
      { time: '14:00', label: 'Accueil des participants' },
      { time: '14:15', label: 'Présentation de l’intervenant' },
      { time: '14:30', label: 'Conférence' },
      { time: '15:45', label: 'Questions de la salle' },
      { time: '16:15', label: 'Échanges informels' },
    ],
  },
  {
    id: 'seminaire',
    kind: 'seminaire',
    label: 'Séminaire',
    hint: 'Une demi-journée de travail sur un thème, en petit groupe.',
    title: 'Séminaire : ',
    summary: 'Une demi-journée de travail sur un thème précis, en petit groupe.',
    startTime: '09:00',
    endTime: '12:30',
    programme: [
      { time: '09:00', label: 'Introduction et tour de table' },
      { time: '09:30', label: 'Première session de travail' },
      { time: '10:45', label: 'Pause' },
      { time: '11:00', label: 'Deuxième session de travail' },
      { time: '12:00', label: 'Synthèse et suites à donner' },
    ],
  },
  {
    id: 'atelier',
    kind: 'atelier',
    label: 'Atelier pratique',
    hint: 'On apprend en faisant, chacun sur sa machine ou son téléphone.',
    title: 'Atelier : ',
    summary: 'Un atelier pratique : chacun repart avec quelque chose de fait.',
    startTime: '14:00',
    endTime: '17:00',
    programme: [
      { time: '14:00', label: 'Installation et vérification du matériel' },
      { time: '14:20', label: 'Démonstration pas à pas' },
      { time: '15:00', label: 'Mise en pratique accompagnée' },
      { time: '16:30', label: 'Présentation des réalisations' },
    ],
  },
  {
    id: 'formation',
    kind: 'formation',
    label: 'Formation',
    hint: 'Une séance de cours, avec un programme annoncé.',
    title: 'Formation : ',
    summary: 'Une séance de formation gratuite, ouverte aux étudiants.',
    startTime: '10:00',
    endTime: '13:00',
    programme: [
      { time: '10:00', label: 'Les bases, pour partir de zéro' },
      { time: '11:00', label: 'Mise en pratique' },
      { time: '12:15', label: 'Questions et ressources pour continuer' },
    ],
  },
  {
    id: 'rencontre',
    kind: 'autre',
    label: 'Rencontre',
    hint: 'Un moment d’échange simple, sans programme chargé.',
    title: 'Rencontre du club',
    summary: 'Un moment d’échange entre membres et curieux.',
    startTime: '15:00',
    endTime: '17:00',
    programme: [
      { time: '15:00', label: 'Accueil' },
      { time: '15:30', label: 'Échanges libres' },
      { time: '16:30', label: 'Prochaines activités du club' },
    ],
  },
]

// Mêmes intentions pour les formations de la page du club : des sujets qui
// marchent auprès d'étudiants, déjà décrits.
export const TRAINING_TEMPLATES = [
  {
    id: 'ia-quotidien',
    label: 'IA au quotidien',
    title: "L'IA au quotidien",
    text: "Les outils d'intelligence artificielle utiles chaque jour : écrire, chercher, traduire, s'organiser, réviser. Gratuits pour la plupart.",
  },
  {
    id: 'cv-linkedin',
    label: 'CV & LinkedIn',
    title: 'CV, LinkedIn et premier emploi',
    text: 'Construire un CV qui passe les filtres, soigner son profil LinkedIn et préparer ses premiers entretiens.',
  },
  {
    id: 'smartphone',
    label: 'Vidéo au smartphone',
    title: 'Filmer & monter au smartphone',
    text: 'Tourner, monter et publier une vidéo propre avec le téléphone que vous avez déjà.',
  },
  {
    id: 'web-ia',
    label: 'Créer son site avec l’IA',
    title: 'Créer son site avec l’IA',
    text: "Créer un site, une landing page ou son propre outil en dialoguant avec l'IA, sans savoir coder.",
  },
  {
    id: 'freelance',
    label: 'Freelance & clients',
    title: 'Trouver ses premiers clients',
    text: 'Se lancer en freelance pendant ses études : se présenter, fixer ses prix, trouver ses premiers clients.',
  },
  {
    id: 'presentation',
    label: 'Prendre la parole',
    title: 'Présenter son projet',
    text: 'Préparer une présentation claire et la défendre devant un jury ou un public.',
  },
]
