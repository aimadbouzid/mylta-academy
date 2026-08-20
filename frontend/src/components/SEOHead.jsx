import { Helmet } from 'react-helmet-async'
import { seoKeywords } from '../data/seoKeywords'

const SITE_NAME  = 'Mylta Academy'
const SITE_URL   = 'https://myltaacademy.com'
const OG_IMAGE   = `${SITE_URL}/og-image.png`

// Langues réellement servies par l'interface (voir src/i18n/translations.js)
const LOCALES = ['fr', 'en', 'ar']

/**
 * SEOHead
 * Balises <head> dynamiques, injectées via react-helmet-async.
 *
 * @param {boolean} noindex  Pages privées (lecteur, tableaux de bord, compte) :
 *                           elles n'ont aucune valeur en résultat de recherche
 *                           et ne renvoient que du contenu vide aux robots.
 * @param {object}  course   Données de formation pour un JSON-LD `Course` exact.
 *                           Sans cet objet, on émet un JSON-LD `WebSite`.
 */
export default function SEOHead({
  title,
  description = "Mylta Academy — Formations 100% accessibles sur smartphone. Apprenez l'IA, le marketing et lancez votre business directement depuis votre téléphone.",
  canonicalPath = '/',
  ogType = 'website',
  ogImage = OG_IMAGE,
  noindex = false,
  course = null,
}) {
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} — Formations sur Smartphone & Outils Premium`
  const canonical = `${SITE_URL}${canonicalPath}`

  // Une image relative n'est jamais résolue par les robots sociaux : on force l'absolu.
  const absoluteImage = ogImage?.startsWith('http') ? ogImage : `${SITE_URL}${ogImage || ''}`

  // JSON-LD : un type `Course` n'est émis que si la page décrit VRAIMENT une
  // formation. L'ancienne détection (`title.includes('Formation')`) marquait
  // aussi la page d'accueil comme un cours — données structurées invalides.
  const jsonLd = course
    ? {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.title,
        description: course.description || description,
        url: canonical,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
        ...(course.price != null && {
          offers: {
            '@type': 'Offer',
            price: String(course.price),
            priceCurrency: 'DZD',
            availability: 'https://schema.org/InStock',
            url: canonical,
          },
        }),
        ...(course.rating > 0 && course.reviewsCount > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(course.rating),
            reviewCount: String(course.reviewsCount),
          },
        }),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description,
      }

  return (
    <Helmet>
      {/* Balises essentielles */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow'}
      />

      {/* Variantes linguistiques : l'interface sert fr, en et ar sur la même URL */}
      {!noindex && LOCALES.map(loc => (
        <link key={loc} rel="alternate" hrefLang={loc} href={canonical} />
      ))}
      {!noindex && <link rel="alternate" hrefLang="x-default" href={canonical} />}

      {/* JSON-LD pour les Rich Snippets Google */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <meta name="keywords" content={seoKeywords.join(', ')} />

      {/* Open Graph (Facebook, Instagram, WhatsApp, Telegram) */}
      <meta property="og:type"         content={ogType} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:url"          content={canonical} />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:image"        content={absoluteImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale"       content="fr_DZ" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={absoluteImage} />

      {/* Géo-ciblage Algérie */}
      <meta name="geo.region"   content="DZ" />
      <meta name="geo.country"  content="Algeria" />
    </Helmet>
  )
}
