// production keys
module.exports = {
  mongoURI: process.env.MONGOATLAS_URI,
  databaseName: process.env.DATABASE_NAME,
  //for JWT creation
  secret: process.env.JWT_SECRET,
  //Nodemailer
  NodemailerEmail: process.env.NODEMAILER_EMAIL,
  NodemailerPassword: process.env.NODEMAILER_PASSWORD,
  //SendGrid
  SendGridKey: process.env.SENDGRID_API_KEY,
  //Apollo Engine
  EngineAPI: process.env.ENGINE_API_KEY,
  //GSuite
  GSuiteServiceClient: process.env.GSUITE_SERVICECLIENT,
  GSuitePrivateKey: process.env.GSUITE_PRIVATEKEY.replace(/\\n/g, "\n"),
  //https://stackoverflow.com/questions/39492587/escaping-issue-with-firebase-privatekey-as-a-heroku-config-variable
};
