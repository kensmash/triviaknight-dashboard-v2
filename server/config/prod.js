// production keys
module.exports = {
  mongoURI: process.env.MONGODB_URI,
  //for JWT creation
  secret: process.env.JWT_SECRET,
  //Nodemailer
  NodemailerEmail: process.env.NODEMAILER_EMAIL,
  NodemailerPassword: process.env.NODEMAILER_PASSWORD,
  //SendGrid
  SendGridKey: process.env.SENDGRID_API_KEY,
  //Apollo Engine
  EngineAPI: process.env.ENGINE_API_KEY
};
