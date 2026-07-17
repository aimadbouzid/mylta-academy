import { Helmet } from 'react-helmet-async'

const SITE_NAME  = 'Mylta Academy'
const SITE_URL   = 'https://myltaacademy.dz'
const OG_IMAGE   = `${SITE_URL}/og-image.jpg` // Placer l'image dans frontend/public/og-image.jpg

/**
 * SEOHead
 * Composant réutilisable pour les balises <head> dynamiques.
 * Utilise react-helmet-async pour une injection SSR-safe.
 *
 * INSTRUCTIONS OG:IMAGE:
 *   1. Créez une image 1200×630px avec le logo Mylta Academy et un fond sombre
 *   2. Exportez-la en JPG sous frontend/public/og-image.jpg
 *   3. En production, changez SITE_URL par votre vrai domaine
 */
export default function SEOHead({
  title,
  description = 'Développez vos compétences en Marketing Digital, Tech, Business et Design. Paiement par CCP et BaridiMob. La plateforme e-learning premium de l\'Algérie.',
  canonicalPath = '/',
  ogType = 'website',
  ogImage = OG_IMAGE,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Formation Premium en Algérie`
  const canonical = `${SITE_URL}${canonicalPath}`

  // Schema.org JSON-LD dynamically generated
  const jsonLd = {
    '@context': 'https://schema.org',
    ...(title && title.includes('Formation') 
      ? {
          '@type': 'Course',
          name: title,
          description: description,
          provider: {
            '@type': 'Organization',
            name: SITE_NAME,
            sameAs: SITE_URL
          }
        }
      : {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description: description
        }
    )
  }

  return (
    <Helmet>
      {/* Balises essentielles */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr-DZ" />

      {/* JSON-LD pour les Rich Snippets Google */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* Mots-clés optimisés Algérie */}
      <meta
        name="keywords"
        content="formation en ligne algérie, cours en ligne DZ, marketing digital algérie, développement web algérie, formation professionnelle, e-learning algérie, CCP paiement, BaridiMob"
      />

      {/* Open Graph (Facebook, Instagram, Telegram) */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"      content="fr_DZ" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* Géo-ciblage Algérie */}
      <meta name="geo.region"   content="DZ" />
      <meta name="geo.country"  content="Algeria" />
    </Helmet>
  )
}
