// Les trois formations gratuites données au club scientifique de l'université
// de Béjaïa (Targa Ouzemmour). Source unique : la page publique et l'espace
// des organisateurs lisent cette liste, pour qu'un intitulé ne puisse pas
// diverger d'un écran à l'autre.
//
// `date` reste vide tant que le club n'a pas arrêté le calendrier : la page
// affiche alors « date bientôt annoncée ».
const TRAININGS = [
  {
    slug: 'vibe-coding',
    title: 'Vibe Coding',
    text: "Créer un site web, une landing page ou votre propre outil en dialoguant avec l'IA : les bases, la méthode et tout ce qu'il faut pour vous lancer sans savoir coder.",
    date: '',
  },
  {
    slug: 'partenariat',
    title: 'Partenariat & clients',
    text: 'Comment trouver ses clients et bâtir ses partenariats : mon parcours, étape par étape.',
    date: '',
  },
  {
    slug: 'smartphone',
    title: 'Filmer & monter au smartphone',
    text: 'Tourner, monter et publier une vidéo propre avec le téléphone que vous avez déjà.',
    date: '',
  },
]

const SLUGS = TRAININGS.map(t => t.slug)

module.exports = { TRAININGS, SLUGS }
