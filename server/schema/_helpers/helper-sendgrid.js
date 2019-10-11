const sgMail = require("@sendgrid/mail");
const keys = require("../../config/keys");

const sendPasswordCodeEmail = async (recipient, name, code) => {
  sgMail.setApiKey(keys.SendGridKey);

  const msg = {
    to: `${name} <${recipient}>`,
    from: "Trivia Knight Support <support@triviaknightapp.com>",
    subject: "Trivia Knight: Forgot Password Code",
    text: "Trivia Knight Forgot Password Code",
    html: `<p>We recently received a request to reset the password for your Trivia Knight account.</p>
        <p>Your confirmation code is <b>${code}</b></p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Still having trouble logging in? Let us know at <a href="mailto:support@triviaknightapp.com">support@triviaknightapp.com</a></p>`
  };

  sgMail
    .send(msg)
    .then(() => {
      //Celebrate
      console.log(`email successfully sent to ${recipient}`);
    })
    .catch(error => {
      //Log friendly error
      console.error(error.toString());
    });
};

const sendPushTicketEmail = async ids => {
  sgMail.setApiKey(keys.SendGridKey);

  const msg = {
    to: "Ken <triviaknighthelp@gmail.com>",
    from: "Trivia Knight <support@triviaknightapp.com>",
    subject: "Trivia Knight: Push Ticket Error",
    text: "Trivia Knight Push Ticket Error",
    html: `<p>One or more push tickets has returned an error.</p>
    <p>Push Ticket ID(s) with errors: ${ids}</p>
    <p>Visit <a href="https://www.triviaknightapp.com/admin/pushtickets">https://www.triviaknightapp.com/admin/pushtickets</a> for more info.`
  };

  sgMail.send(msg).catch(error => {
    //Log friendly error
    console.error(error.toString());
  });
};

const sendPushReceiptEmail = async (id, message, details) => {
  sgMail.setApiKey(keys.SendGridKey);

  const msg = {
    to: "Ken <triviaknighthelp@gmail.com>",
    from: "Trivia Knight <support@triviaknightapp.com>",
    subject: "Trivia Knight: Push Receipt Error",
    text: "Trivia Knight Push Receipt Error",
    html: `<p>A push receipt with id ${id} has returned an error.</p>
    <p>Message: ${message}</p>
    <p>Details: ${details}</p>
    <p>Visit <a href="https://www.triviaknightapp.com/admin/pushreceipts">https://www.triviaknightapp.com/admin/pushreceipts</a> for more info.`
  };

  sgMail.send(msg).catch(error => {
    //Log friendly error
    console.error(error.toString());
  });
};

const sendSupportRequestResponseEmail = async (to, subject, message) => {
  sgMail.setApiKey(keys.SendGridKey);

  const msg = {
    to: `${to}`,
    from: "Trivia Knight <support@triviaknightapp.com>",
    subject: `${subject}`,
    text: `${message}`,
    html: `${message}`
  };

  sgMail.send(msg).catch(error => {
    //Log friendly error
    console.error(error.toString());
  });
};

module.exports = {
  sendPasswordCodeEmail,
  sendPushTicketEmail,
  sendPushReceiptEmail,
  sendSupportRequestResponseEmail
};
