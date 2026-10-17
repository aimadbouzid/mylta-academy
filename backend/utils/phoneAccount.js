// Comptes créés pour les participants du présentiel : identifiant = numéro de téléphone.
// Le modèle User exige un email unique ; on dérive donc une adresse technique du numéro.
const crypto = require('crypto')
const argon2 = require('argon2')
const prisma = require('../prisma')

const PHONE_DOMAIN = 'tel.myltaacademy.com'

const phoneDigits = (phone) => String(phone || '').replace(/\D/g, '')
const phoneToEmail = (phone) => `${phoneDigits(phone)}@${PHONE_DOMAIN}`

// Sans caractères ambigus (0/O, 1/l/I) : le mot de passe est souvent recopié à la main.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const generatePassword = (length = 10) =>
  Array.from(crypto.randomBytes(length), b => ALPHABET[b % ALPHABET.length]).join('')

class AccountExistsError extends Error {}

async function createPhoneAccount({ fullName, phone }) {
  const email = phoneToEmail(phone)
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw new AccountExistsError('Un compte existe déjà pour ce numéro. Connectez-vous avec votre numéro et votre mot de passe.')
  }
  const password = generatePassword()
  const user = await prisma.user.create({
    data: {
      email,
      password: await argon2.hash(password),
      name: fullName,
      role: 'STUDENT',
      authProvider: 'LOCAL',
      emailVerified: true,
    },
  })
  // Chargé ici pour éviter une dépendance circulaire avec registrations.js.
  await require('./registrations').notifyExistingRegistrations(user.id, phone)
  return { login: phoneDigits(phone), password }
}

// L'admin régénère l'accès d'une personne qui a déjà un compte (mot de passe oublié…).
async function resetPhoneAccount({ phone }) {
  const password = generatePassword()
  await prisma.user.update({ where: { email: phoneToEmail(phone) }, data: { password: await argon2.hash(password) } })
  return { login: phoneDigits(phone), password, reset: true }
}

// Crée le compte, ou (reset) donne un nouveau mot de passe s'il existe déjà.
async function provideAccount({ fullName, phone, reset }) {
  try {
    return await createPhoneAccount({ fullName, phone })
  } catch (err) {
    if (err instanceof AccountExistsError && reset) return resetPhoneAccount({ phone })
    throw err
  }
}

module.exports = { phoneToEmail, phoneDigits, createPhoneAccount, provideAccount, AccountExistsError }
