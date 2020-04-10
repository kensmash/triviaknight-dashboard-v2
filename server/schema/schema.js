const { gql } = require("apollo-server-express");
//schema
const users = require("./users");
//categories
const categoryTypes = require("./categoryTypes");
const categoryGenres = require("./categoryGenres");
const categoryGroups = require("./categoryGroups");
const categories = require("./categories");
//questions
const questions = require("./questions");
const questionReports = require("./questionReports");
//games
const gamesSolo = require("./gamesSolo");
const gamesJoust = require("./gamesJoust");
const gamesSiege = require("./gamesSiege");
const gamesPressYourLuck = require("./gamesPressYourLuck");
const gamesQuest = require("./gamesQuest");
const gamesHosted = require("./gamesHosted");
//stats
const stats = require("./stats");
//misc
const expoPushNotifications = require("./expoPushNotifications");
const supportRequests = require("./supportRequests");

const typeDef = gql`
  type Query
  type Mutation
`;

module.exports = {
  typeDefs: [
    typeDef,
    users.typeDef,
    categoryTypes.typeDef,
    categoryGenres.typeDef,
    categoryGroups.typeDef,
    categories.typeDef,
    questions.typeDef,
    questionReports.typeDef,
    gamesSolo.typeDef,
    gamesJoust.typeDef,
    gamesSiege.typeDef,
    gamesPressYourLuck.typeDef,
    gamesQuest.typeDef,
    gamesHosted.typeDef,
    stats.typeDef,
    expoPushNotifications.typeDef,
    supportRequests.typeDef,
  ],
  resolvers: [
    users.resolvers,
    categoryTypes.resolvers,
    categoryGenres.resolvers,
    categoryGroups.resolvers,
    categories.resolvers,
    questions.resolvers,
    questionReports.resolvers,
    gamesSolo.resolvers,
    gamesJoust.resolvers,
    gamesSiege.resolvers,
    gamesPressYourLuck.resolvers,
    gamesQuest.resolvers,
    stats.resolvers,
    expoPushNotifications.resolvers,
    supportRequests.resolvers,
  ],
};
