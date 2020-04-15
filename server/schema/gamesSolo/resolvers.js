const GameSolo = require("../../models/GameSolo");
const CategoryType = require("../../models/CategoryType");
//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
const { userCategoriesQuestions } = require("../_helpers/helper-questions");
//questions helper
const { soloQuestions } = require("../_helpers/helper-questions");

const resolvers = {
  Query: {
    solotopics: requiresAuth.createResolver(async (parent, { args }) => {
      try {
        const types = await CategoryType.find({
          playable: { $eq: true },
        });

        return types;
      } catch (error) {
        console.error(error);
      }
    }),

    allsologames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const allsologames = await GameSolo.find({
            "players.player": user.id,
          }).populate("currentcategory");
          return allsologames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    newsologame: requiresAuth.createResolver((parent, { args }, { user }) => {
      return userCategoriesQuestions(user);
    }),

    currentsologame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentsologame = await GameSolo.findOne({
            _id: id,
            "players.player": user.id,
          })
            .populate("players.player")
            .populate("players.roundresults.category")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("currentquestion")
            .populate("selectedcategories")
            .populate("selectedquestions");

          return currentsologame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Mutation: {
    createsologame: requiresAuth.createResolver(
      async (parent, { typeid, typename }, { user }) => {
        try {
          const catsAndQuestions = await soloQuestions(typeid);

          const newgame = new GameSolo({
            players: [{ player: user.id, rewards: { addtotimer: 0 } }],
            categoriestype: typename,
            categories: catsAndQuestions.categories,
            questions: catsAndQuestions.questions,
          });

          const newGame = await newgame.save();
          const returnedGame = await GameSolo.findOne({
            _id: newGame._id,
          })
            .populate("players.player")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate("questions");
          return returnedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    entersoloanswer: requiresAuth.createResolver(
      async (parent, { gameid, roundresults, endgame }, { user }) => {
        try {
          //first add round results
          let updatedGame = await GameSolo.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } },
            },
            { new: true }
          );

          if (endgame) {
            updatedGame = await GameSolo.findOneAndUpdate(
              { _id: gameid, "players.player": user.id },
              {
                $set: { gameover: true },
              },
              { new: true }
            );
          }
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    savesologame: requiresAuth.createResolver(
      async (_, { results }, { user, expo }) => {
        try {
          const newgame = new GameSolo({
            players: [{ player: user.id, roundresults: results }],
          });

          const soloGame = await newgame.save();

          return soloGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },
};

module.exports = {
  resolvers,
};
