const http = require("http");
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const session = require("express-session");
const redis = require("redis"),
  redisclient = redis.createClient(process.env.REDIS_URL);
const { RedisPubSub } = require("graphql-redis-subscriptions");
const RedisStore = require("connect-redis")(session);
const mongoose = require("mongoose");
const path = require("path");
const url = require("url");
const redirectToHTTPS = require("express-http-to-https").redirectToHTTPS;
const { Expo } = require("expo-server-sdk");
//some config
const keys = require("./config/keys");
//schema
const schema = require("./schema/schema");
//scheduled jobs
require("./jobs/jobs-categories");
require("./jobs/jobs-quest");
require("./jobs/jobs-joustgames");
require("./jobs/jobs-siegegames");
require("./jobs/jobs-roundtablegames");
require("./jobs/jobs-pushnotifications");

mongoose.connect(keys.mongoURI, {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
});

const expo = new Expo();

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
