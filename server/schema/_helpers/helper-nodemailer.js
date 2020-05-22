const nodemailer = require("nodemailer");
const keys = require("../../config/keys");

const YOUR_EMAIL_ADDRESS = "support@triviaknightapp.com";

const sendPasswordCodeEmail = async (recipient, name, code) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: YOUR_EMAIL_ADDRESS,
      serviceClient: keys.GSuiteServiceClient,
      privateKey: keys.GSuitePrivateKey,
    },
  });
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: YOUR_EMAIL_ADDRESS,
      to: `${name} <${recipient}>`,
      from: "Trivia Knight Support <support@triviaknightapp.com>",
      subject: "Trivia Knight: Forgot Password Code",
      text: "Trivia Knight Forgot Password Code",
      html: `<p>We recently received a request to reset the password for your Trivia Knight account.</p>
        <p>Your confirmation code is <b>${code}</b></p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Still having trouble logging in? Let us know at <a href="mailto:support@triviaknightapp.com">support@triviaknightapp.com</a></p>`,
    });
  } catch (err) {
    console.error(err);
  }
};

const sendPushReceiptEmail = async (id, message, details) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: YOUR_EMAIL_ADDRESS,
      serviceClient: keys.GSuiteServiceClient,
      privateKey: keys.GSuitePrivateKey,
    },
  });
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: YOUR_EMAIL_ADDRESS,
      to: "Ken <ken@triviaknightapp.com>",
      subject: "Trivia Knight: Push Receipt Error",
      text: "Trivia Knight Push Receipt Error",
      html: `<p>A push receipt with id ${id} has returned an error.</p>
    <p>Message: ${message}</p>
    <p>Details: ${details}</p>
    <p>Visit <a href="https://www.triviaknightapp.com/admin/pushreceipts">https://www.triviaknightapp.com/admin/pushreceipts</a> for more info.`,
    });
  } catch (err) {
    console.error(err);
  }
};

const sendPushTicketEmail = async (ids) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: YOUR_EMAIL_ADDRESS,
      serviceClient: keys.GSuiteServiceClient,
      privateKey: keys.GSuitePrivateKey,
    },
  });
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: YOUR_EMAIL_ADDRESS,
      to: "Ken <ken@triviaknightapp.com>",
      subject: "Trivia Knight: Push Ticket Error",
      text: "Trivia Knight Push Ticket Error",
      html: `<p>One or more push tickets has returned an error.</p>
      <p>Push Ticket ID(s) with errors: ${ids}</p>
      <p>Visit <a href="https://www.triviaknightapp.com/admin/pushtickets">https://www.triviaknightapp.com/admin/pushtickets</a> for more info.`,
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  sendPasswordCodeEmail,
  sendPushReceiptEmail,
  sendPushTicketEmail,
};
