const fs = require('fs')
const path = require('path')
const prisma = require('../prisma')

const uploadsDir = path.join(__dirname, '../uploads/receipts')

async function cleanupOldReceipts() {
  console.log('🧹 [CRON] Démarrage du nettoyage des fichiers obsolètes et orphelins...')
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // 1. Nettoyage des reçus liés obsolètes
    const oldReceipts = await prisma.receipt.findMany({
      where: {
        status: { in: ['REJECTED', 'APPROVED', 'PENDING'] },
        createdAt: { lt: thirtyDaysAgo },
        receiptImage: { not: null }
      },
      select: { id: true, receiptImage: true, notes: true }
    })

    let deletedLinkedCount = 0
    for (const receipt of oldReceipts) {
      if (receipt.receiptImage) {
        const filename = path.basename(receipt.receiptImage)
        const filePath = path.join(uploadsDir, filename)
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          deletedLinkedCount++
        }

        await prisma.receipt.update({
          where: { id: receipt.id },
          data: { receiptImage: null, notes: receipt.notes ? receipt.notes + ' (Image purgée)' : 'Image purgée par le système' }
        })
      }
    }

    // 2. Nettoyage des reçus orphelins (DoS Mitigation: Fichiers uploadés mais non liés)
    let deletedOrphanedReceipts = 0
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      for (const file of files) {
        if (file === '.gitkeep') continue
        const filePath = path.join(uploadsDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtimeMs < oneDayAgo) {
          const isReferencedReceipt = await prisma.receipt.findFirst({
            where: { receiptImage: { endsWith: file } },
            select: { id: true }
          })
          const isReferencedInstructor = await prisma.instructorApplication.findFirst({
            where: { receiptImage: { endsWith: file } },
            select: { id: true }
          })
          if (!isReferencedReceipt && !isReferencedInstructor) {
            fs.unlinkSync(filePath)
            deletedOrphanedReceipts++
          }
        }
      }
    }

    // 3. Nettoyage des thumbnails orphelins
    let deletedOrphanedThumbs = 0
    const thumbnailsDir = path.join(__dirname, '../uploads/thumbnails')
    if (fs.existsSync(thumbnailsDir)) {
      const thumbFiles = fs.readdirSync(thumbnailsDir)
      for (const file of thumbFiles) {
        if (file === '.gitkeep') continue
        const filePath = path.join(thumbnailsDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.mtimeMs < oneDayAgo) {
          const isReferenced = await prisma.course.findFirst({
            where: { thumbnail: { endsWith: file } },
            select: { id: true }
          })
          if (!isReferenced) {
            fs.unlinkSync(filePath)
            deletedOrphanedThumbs++
          }
        }
      }
    }

    if (deletedLinkedCount > 0 || deletedOrphanedReceipts > 0 || deletedOrphanedThumbs > 0) {
      console.log(`✅ [CRON] Nettoyage terminé. Reçus purgés: ${deletedLinkedCount}, Reçus orphelins: ${deletedOrphanedReceipts}, Thumbnails orphelins: ${deletedOrphanedThumbs}.`)
    } else {
      console.log('✅ [CRON] Aucun fichier obsolète à supprimer.')
    }
  } catch (error) {
    console.error('❌ [CRON] Erreur lors du nettoyage:', error)
  }
}

function initCron() {
  // On lance le premier nettoyage 10 secondes après le démarrage du serveur
  setTimeout(cleanupOldReceipts, 10000)
  
  // Puis on répète l'opération toutes les 24 heures (24 * 60 * 60 * 1000)
  setInterval(cleanupOldReceipts, 24 * 60 * 60 * 1000)
}

module.exports = { initCron, cleanupOldReceipts }
