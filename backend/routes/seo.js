// routes/seo.js — robots.txt + sitemap.xml dynamique (Prompt SEO)

const express = require('express')
const prisma = require('../prisma')

const router = express.Router()

const BASE_URL = process.env.SITE_URL || 'https://myltaacademy.dz'

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /uploads/

# Ressources publiques autorisées
Allow: /api/courses

Sitemap: ${BASE_URL}/sitemap.xml
`)
})

// GET /sitemap.xml — Sitemap dynamique
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/courses', priority: '0.9', changefreq: 'daily' },
    ]

    const coursePages = courses.map(c => ({
      url: `/courses/${c.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: c.updatedAt.toISOString().split('T')[0],
    }))

    const allPages = [...staticPages, ...coursePages]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`

    res.type('application/xml')
    res.send(xml)
  } catch (err) { next(err) }
})

module.exports = router
