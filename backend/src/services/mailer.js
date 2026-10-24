const nodemailer = require('nodemailer');
const { smtpHost, smtpPort, smtpUser, smtpPass, mailFrom, frontendUrl } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  // Port 465 is implicit TLS; everything else (587, MailHog's 1025, ...) starts plain and
  // upgrades via STARTTLS, which nodemailer handles on its own when secure is false.
  secure: smtpPort === 465,
  auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
});

async function sendConfirmationEmail(email, token) {
  const confirmUrl = `${frontendUrl.replace(/\/$/, '')}/confirm/${token}`;

  await transporter.sendMail({
    from: mailFrom,
    to: email,
    subject: 'Confirm your account',
    text: `Confirm your account by visiting: ${confirmUrl}`,
    html: `
      <p>Welcome! Confirm your account to start building your dashboard.</p>
      <p><a href="${confirmUrl}">Confirm my account</a></p>
      <p>Or copy this link: ${confirmUrl}</p>
    `,
  });
}

module.exports = { sendConfirmationEmail };
