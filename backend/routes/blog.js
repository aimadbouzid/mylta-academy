const express = require('express')
const prisma = require('../prisma')
const { authenticate, isAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/blog (Public) - Liste des articles de blog publiés
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          thumbnail: true,
          createdAt: true,
          author: { select: { name: true } },
        },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where: { isPublished: true } })
    ])

    res.json({
      posts,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (err) { next(err) }
})

// GET /api/blog/:slug (Public) - Lire un article
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { name: true } } }
    })
    
    if (!post || !post.isPublished) {
      return res.status(404).json({ error: 'Article introuvable' })
    }

    res.json(post)
  } catch (err) { next(err) }
})

// === Routes Admin ===

// POST /api/blog (Admin) - Créer un article
router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { title, slug, content, summary, thumbnail, isPublished } = req.body
    
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Titre, slug et contenu sont obligatoires' })
    }

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        summary: summary || null,
        thumbnail: thumbnail || null,
        isPublished: isPublished || false,
        authorId: req.user.id
      }
    })

    res.status(201).json(newPost)
  } catch (err) { 
    if (err.code === 'P2002') return res.status(400).json({ error: 'Ce slug est déjà utilisé' })
    next(err) 
  }
})

// PUT /api/blog/:id (Admin) - Modifier un article
router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { title, slug, content, summary, thumbnail, isPublished } = req.body

    const updated = await prisma.blogPost.update({
      where: { id: parseInt(req.params.id) },
      data: { title, slug, content, summary, thumbnail, isPublished }
    })

    res.json(updated)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Article introuvable' })
    if (err.code === 'P2002') return res.status(400).json({ error: 'Ce slug est déjà utilisé' })
    next(err)
  }
})

// DELETE /api/blog/:id (Admin) - Supprimer un article
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Article introuvable' })
    next(err)
  }
})

module.exports = router
