import nodemailer from "nodemailer";
import "dotenv/config";
import { Email } from "../../src/types/email_elements.js";

// Create a transporter using Ethereal test credentials.
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send an email using async/await
export async function sendEmailAction(payload: Email) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: payload.to,
    subject: payload.subject,
    text: payload.body,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent:\ninfo:\n", info);

  return info;
}
