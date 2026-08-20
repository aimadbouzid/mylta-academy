const nodemailer = require('nodemailer');

// Le mailer n'est utilisable que si des identifiants SMTP sont présents.
// Sans eux, les envois sont ignorés : les appelants doivent le savoir pour
// ne pas laisser un utilisateur bloqué en attente d'un email jamais parti.
const isMailerConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordEmail = async (to, resetUrl) => {
  const mailOptions = {
    from: `"Mylta Academy" <${process.env.SMTP_USER || 'noreply@myltaacademy.com'}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe - Mylta Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">MYLTA ACADEMY</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Bonjour,</h2>
          <p style="color: #555; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe sur Mylta Academy. 
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. 
            Ce lien est valide pendant 1 heure.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #a93232; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #777; font-size: 14px;">
            Si vous n'avez pas fait cette demande, vous pouvez ignorer cet email.
          </p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e1e1e1;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Mylta Academy. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  if (!isMailerConfigured()) {
    console.warn('⚠️ SMTP non configuré dans .env. L\'email de reset aurait été :', resetUrl);
    return false; // Fallback silently in dev if no SMTP
  }

  await transporter.sendMail(mailOptions);
  return true;
};

const sendVerificationEmail = async (to, verifyUrl) => {
  const mailOptions = {
    from: `"Mylta Academy" <${process.env.SMTP_USER || 'noreply@myltaacademy.com'}>`,
    to,
    subject: 'Activation de votre compte - Mylta Academy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">MYLTA ACADEMY</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Bienvenue !</h2>
          <p style="color: #555; line-height: 1.6;">
            Merci de vous être inscrit sur Mylta Academy. 
            Veuillez cliquer sur le bouton ci-dessous pour activer votre compte. 
            Ce lien est valide pendant 24 heures.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #a93232; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Activer mon compte
            </a>
          </div>
          <p style="color: #777; font-size: 14px;">
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; border-top: 1px solid #e1e1e1;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Mylta Academy. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  if (!isMailerConfigured()) {
    console.warn('⚠️ SMTP non configuré dans .env. L\'email d\'activation aurait été :', verifyUrl);
    return false;
  }

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = { sendResetPasswordEmail, sendVerificationEmail, isMailerConfigured };
