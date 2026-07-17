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

    // 2. Fetch the referrer
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
      select: { id: true, name: true, email: true, referralCount: true, freeCoursesEarned: true }
    })

    if (!referrer) return

    const newCount = referrer.referralCount + 1
    let freeCoursesEarnedIncrement = 0
    let finalCount = newCount
    let message = ""
    let title = ""

    if (newCount >= 3) {
      freeCoursesEarnedIncrement = 1
      finalCount = 0
      title = "Félicitations ! Formation gratuite obtenue 🎁"
      message = `3 achats de vos filleuls ont été validés (le dernier par ${user.name || user.email}). Vous avez gagné 1 crédit de formation gratuite !`
    } else {
      const remaining = 3 - newCount
      title = "Nouvel achat de filleul ! 🚀"
      message = `Votre filleul ${user.name || user.email} a acheté la formation "${courseTitle}". Plus que ${remaining} personne${remaining > 1 ? 's' : ''} pour obtenir votre formation gratuite.`
    }

    // Update referrer in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: referrerId },
        data: {
          referralCount: finalCount,
          freeCoursesEarned: referrer.freeCoursesEarned + freeCoursesEarnedIncrement
        }
      }),
      prisma.notification.create({
        data: {
          userId: referrerId,
          title,
          message,
          type: freeCoursesEarnedIncrement > 0 ? 'SUCCESS' : 'INFO'
        }
      })
    ])

    console.log(`[REFERRAL] Processed referral for referrer ${referrer.email}. New count: ${finalCount}, Free courses: ${referrer.freeCoursesEarned + freeCoursesEarnedIncrement}`)

  } catch (error) {
    console.error("[REFERRAL ERROR] Failed to process referral:", error)
  }
}

module.exports = {
  processReferral
}
