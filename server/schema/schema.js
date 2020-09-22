const { gql } = require("apollo-server-express");
//schema
const users = require("./users");
//announcements
const announcements = require("./announcements");
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
const gamesQuest = require("./gamesQuest");
const gamesRoundTable = require("./gamesRoundTable");
//stats
const stats = require("./stats");
//misc
const expoPushNotifications = require("./expoPushNotifications");

const typeDef = gql`
  type Query
  type Mutation
  type Subscription
`;

module.exports = {
  typeDefs: [
    typeDef,
    announcements.typeDef,
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
    gamesQuest.typeDef,
    gamesRoundTable.typeDef,
    stats.typeDef,
    expoPushNotifications.typeDef,
  ],
  resolvers: [
    announcements.resolvers,
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
    gamesQuest.resolvers,
    gamesRoundTable.resolvers,
    stats.resolvers,
    expoPushNotifications.resolvers,
  ],
};
