const GameSolo = require("../../models/GameSolo");
//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
const { randomCategoriesQuestions } = require("../_helpers/helper-questions");

const resolvers = {
  Query: {
    allsologames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const allsologames = await GameSolo.find({
            "players.player": user.id
          }).populate("currentcategory");
          return allsologames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    newsologame: requiresAuth.createResolver((parent, { args }, { user }) => {
      return randomCategoriesQuestions(6, "Normal");
    }),

    currentgame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentsologame = await GameSolo.findOne({
            _id: id,
            "players.player": user.id
          })
            .populate("players.player")
            .populate("players.roundresults.category")
            .populate({
              path: "categories",
              populate: { path: "type" }
            })
            .populate({
              path: "currentcategory",
              populate: { path: "type" }
            })
            .populate("currentquestion")
            .populate("selectedcategories")
            .populate("selectedquestions");

          return currentsologame;
        } catch (error) {
          console.error(error);
        }
      }
    )
  },

  Mutation: {
    savesologame: requiresAuth.createResolver(
      async (_, { results }, { user, expo }) => {
        try {
          const newgame = new GameSolo({
            players: [{ player: user.id, roundresults: results }]
          });

          const soloGame = await newgame.save();

          return soloGame;
        } catch (error) {
          console.error(error);
        }
      }
    )
  }
};

module.exports = {
  resolvers
};
