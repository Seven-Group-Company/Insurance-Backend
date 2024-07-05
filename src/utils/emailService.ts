import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

export const sendEmail = (template: string, to: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `SGC-Insurance <${process.env.USER_EMAIL}>`,
    to,
    subject,
    html: template,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return error;
    } else {
      return "Email sent";
    }
  });
};
