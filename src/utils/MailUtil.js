const mailer = require("nodemailer");

const mailSend = async (to, subject, text, attachments = [], html = null) => {
  const transport = mailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  const mailOptions = {
    to: to,
    from: "[EMAIL_ADDRESS]",
    subject: subject,
    text: text,
    html: html || `<h1>${text}</h1>`,
    attachments: attachments
  };

  await transport.sendMail(mailOptions)

};

module.exports = mailSend