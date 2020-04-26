const http = require("http");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const session = require("express-session");
const redis = require("redis"),
  redisclient = redis.createClient(process.env.REDIS_URL);
const RedisStore = require("connect-redis")(session);
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
//some config
const keys = require("./config/keys");
//schema
const schema = require("./schema/schema");
//scheduled jobs
const { newCategories } = require("./jobs/jobs-categories");
const { weeklyQuestTopic, changeQuestTopic } = require("./jobs/jobs-quest");
const {
  deleteDeclinedJoustGames,
  timeOutJoustGames,
  deleteTimedOutJoustGames,
  runningOutOfTime,
} = require("./jobs/jobs-joustgames");
const {
  checkPushReceipts,
  deletePushTickets,
  pushTicketErrorCheck,
} = require("./jobs/jobs-pushnotifications");

mongoose.connect(keys.mongoURI, {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
});

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({
  ...schema,
  //playground: true,
  //introspection: true,
  context: async ({ req }) => {
    return {
      secret: keys.secret,
      req: req,
      redisclient: redisclient,
      user: req.session.user,
      expo,
    };
  },
});

const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); //trust first proxy
  app.use(redirectToHTTPS()); //force https
}

//parse inbound emails
//https://sendgrid.com/docs/for-developers/tracking-events/nodejs-code-example/
//and holy geez https://blog.padpiper.com/a-guide-to-inbound-parse-with-sendgrid-nodejs-382a266f8c3f
//and https://sendgrid.com/blog/how-we-use-inbound-parse-on-the-community-development-team/
const upload = multer();
app.post("/parse", upload.array(), async function (req, res) {
  const from = req.body.from;
  const to = req.body.to;
  const text = req.body.text;
  const subject = req.body.subject;
  //var num_attachments = req.body.attachments;
  if (to === "support@triviaknightapp.com") {
    //save this to database
    try {
      const newrequest = new SupportRequest({
        from,
        text,
        subject,
      });
      await newrequest.save();
    } catch (error) {
      console.error(error);
    }
  }
  res.sendStatus(200);
});

app.use(
  session({
    store: new RedisStore({ client: redisclient }),
    name: "qid",
    secret: keys.secret,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    },
  })
);

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../client/build")));

// non-api requests return the React app, so it can handle routing.
if (process.env.NODE_ENV === "production") {
  app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
}

server.applyMiddleware({
  app,
  path: "/",
});

const httpServer = http.createServer(app);

httpServer
  .listen({ port: PORT }, () =>
    console.log(`🚀 Server ready at ${PORT}${server.graphqlPath}`)
  )
  .on("error", function (err) {
    console.log("on error handler");
    console.log(err);
  });

process.on("uncaughtException", function (err) {
  console.log("process.on handler");
  console.log(err);
});
