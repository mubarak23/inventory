import nodemailer from 'nodemailer';
const sendMail = async (subject, message, send_to, send_from, reply_to) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  const mailOption = {
    from: send_from,
    to: send_to,
    replyTo: reply_to,
    subject,
    html: message,
  };
  // send the mail
  transporter.sendMail(mailOption, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

export default sendMail;
