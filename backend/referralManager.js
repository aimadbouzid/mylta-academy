const prisma = require('./prisma')

/**
 * Process a successful referral payment.
 * Increments referrer's referralCount and awards a free course credit if they reach 3.
 * 
 * @param {number} userId The ID of the student who made the purchase
 * @param {string} courseTitle The title of the course purchased
 */
async function processReferral(userId, courseTitle) {
  try {
    // 1. Fetch user to check if referred by someone
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, referredById: true }
    })

    if (!user || !user.referredById) {
      return
    }

    const referrerId = user.referredById

    // Update referrer in a transaction atomically
    await prisma.$transaction(async (tx) => {
      const updatedReferrer = await tx.user.update({
        where: { id: referrerId },
        data: { referralCount: { increment: 1 } },
        select: { referralCount: true }
      })

      let title = ""
      let message = ""
      let freeCourse = false

      if (updatedReferrer.referralCount >= 3) {
        freeCourse = true
        title = "Félicitations ! Formation gratuite obtenue 🎁"
        message = `3 achats de vos filleuls ont été validés (le dernier par ${user.name || user.email}). Vous avez gagné 1 crédit de formation gratuite !`
        
        await tx.user.update({
          where: { id: referrerId },
          data: { 
            referralCount: { decrement: 3 }, 
            freeCoursesEarned: { increment: 1 } 
          }
        })
      } else {
        const remaining = 3 - updatedReferrer.referralCount
        title = "Nouvel achat de filleul ! 🚀"
        message = `Votre filleul ${user.name || user.email} a acheté la formation "${courseTitle}". Plus que ${remaining} personne${remaining > 1 ? 's' : ''} pour obtenir votre formation gratuite.`
      }

      await tx.notification.create({
        data: {
          userId: referrerId,
          title,
          message,
          type: freeCourse ? 'SUCCESS' : 'INFO'
        }
      })
      
      console.log(`[REFERRAL] Processed referral for referrer ID ${referrerId}. Atomic count updated.`)
    })

  } catch (error) {
    console.error("[REFERRAL ERROR] Failed to process referral:", error)
  }
}

module.exports = {
  processReferral
}
