const http = require("http");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const session = require("express-session");
const redis = require("redis"),
  redisclient = redis.createClient(process.env.REDIS_URL);
const { RedisPubSub } = require("graphql-redis-subscriptions");
const RedisStore = require("connect-redis")(session);
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const url = require("url");
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
//some config
const keys = require("./config/keys");
//schema
const schema = require("./schema/schema");
//scheduled jobs
const { newCategories, updatedCategories } = require("./jobs/jobs-categories");
const {
  weeklyQuestTopicNotification,
  weeklyHighScoreNotification,
  changeQuestTopic,
} = require("./jobs/jobs-quest");
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
const redis_uri = process.env.REDIS_URL && url.parse(process.env.REDIS_URL);
//https://devcenter.heroku.com/articles/securing-heroku-redis
const pubsub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_URL && redis_uri.hostname,
    port: process.env.REDIS_URL ? Number(redis_uri.port) : 6379,
    password: process.env.REDIS_URL && redis_uri.auth.split(":")[1],
    retry_strategy: (options) => {
      // reconnect after
      return Math.max(options.attempt * 100, 3000);
    },
  },
});

/*const server = new ApolloServer({
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
});*/

const server = new ApolloServer({
  ...schema,
  context: async ({ req, connection }) => {
    if (connection) {
      //subscription coming through
      return { pubsub };
    } else {
      return {
        secret: keys.secret,
        req: req,
        redisclient: redisclient,
        user: req.session.user,
        pubsub,
        expo,
      };
    }
  },
  subscriptions: {
    keepAlive: 10000,
  },
  //introspection: true,
  engine: {
    apiKey: keys.EngineAPI,
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
server.installSubscriptionHandlers(httpServer);

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
