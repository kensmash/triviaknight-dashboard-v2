const GameSolo = require("../../models/GameSolo");
const User = require("../../models/User");
const CategoryType = require("../../models/CategoryType");
//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//questions helper
const {
  soloQuestions,
  differentQuestion,
} = require("../_helpers/helper-questions");

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

    solocatsandquestions: (_parent, { type }) => {
      return soloQuestions(type);
    },

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
      async (parent, { typeid, typename, timer }, { user }) => {
        try {
          //deduct gems for time boost
          if (timer > 30000) {
            let gems = 0;
            if (timer === 45000) {
              gems = -5;
            }
            if (timer === 60000) {
              gems = -10;
            }
            await User.findOneAndUpdate(
              { _id: user.id },
              { $inc: { gems } },
              { $set: { lastActiveAt: Date.now() } }
            );
          } else {
            await User.findOneAndUpdate(
              { _id: user.id },
              { $set: { lastActiveAt: Date.now() } }
            );
          }
          const catsAndQuestions = await soloQuestions(typeid);

          const newgame = new GameSolo({
            players: [{ player: user.id, timer }],
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

    changesoloquestion: requiresAuth.createResolver(
      async (parent, { input }) => {
        let questions = [];

        if (input.replacedquestions.length) {
          questions = input.currentquestions.concat(input.replacedquestions);
        } else {
          questions = input.currentquestions;
        }

        try {
          //get new question
          const newQuestion = await differentQuestion(
            input.category,
            questions
          );

          let slicedQuestions = input.currentquestions.slice();

          //update current questions array
          slicedQuestions.splice(input.questionindex, 1, newQuestion._id);

          //update game
          let updatedGame = await GameSolo.findOneAndUpdate(
            { _id: input.gameid },
            {
              $set: { questions: slicedQuestions },
              $addToSet: { replacedquestions: input.questionid },
            },
            { new: true }
          )
            .populate("questions")
            .populate("replacedquestions");

          return updatedGame;
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
