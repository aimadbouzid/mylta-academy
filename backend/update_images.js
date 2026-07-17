const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function run() {
  const courses = await prisma.course.findMany()
  for (const c of courses) {
    let thumb = null
    if (c.title.includes('Développement') || c.category === 'Tech') {
      thumb = 'http://localhost:3000/uploads/thumbnails/cover-dev.png'
    } else if (c.title.includes('Marketing')) {
      thumb = 'http://localhost:3000/uploads/thumbnails/cover-marketing.png'
    } else if (c.title.includes('UX') || c.title.includes('Design')) {
      thumb = 'http://localhost:3000/uploads/thumbnails/cover-design.png'
    } else {
      thumb = 'http://localhost:3000/uploads/thumbnails/cover-dev.png' // default fallback
    }
    
    await prisma.course.update({
      where: { id: c.id },
      data: { thumbnail: thumb }
    })
    console.log(`Updated course ${c.id} (${c.title}) to thumbnail ${thumb}`)
  }
}
run()
