import "dotenv/config";
import Mailgun from "mailgun.js";
import formData from "form-data";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

export const sendEmail = async ({ to, subject, text }) => {
  const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: process.env.EMAIL_SENDER,
    to: to,
    subject: subject,
    text: text,
  });

  console.log(response);
  return response;
};
