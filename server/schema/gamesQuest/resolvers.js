const GameQuest = require("../../models/GameQuest");
const User = require("../../models/User");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");
//query helpers
const {
  currentQuestTopic,
  nextQuestTopic,
} = require("../_helpers/helper-gamesquest");
const {
  questQuestions,
  differentQuestion,
} = require("../_helpers/helper-questions");

const resolvers = {
  Query: {
    questgamepage: requiresAuth.createResolver(
      async (parent, { offset, limit, players, gameover }) => {
        const queryBuilder = (players, gameover) => {
          const query = {};

          if (gameover) {
            query.gameover = { $eq: gameover };
          }
          if (players) {
            query.players = { $all: players };
          }

          return query;
        };
        try {
          const questgames = await Promise.all([
            GameQuest.find(queryBuilder(players, gameover))
              .sort({ createdAt: -1 })
              .skip(offset)
              .limit(limit)
              .populate("players.player"),
            GameQuest.find(queryBuilder(players, gameover)).count(),
          ]);
          const questResults = questgames[0];
          const questCount = questgames[1];
          return {
            pages: Math.ceil(questCount / limit),
            totalrecords: questCount,
            questgames: questResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentquestgame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentquestgame = await GameQuest.findOne({
            _id: id,
            "players.player": user.id,
          })

            .populate("players.player")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate("questions");

          return currentquestgame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentquesttopic: (parent, args) => {
      return currentQuestTopic();
    },

    nextquesttopic: requiresAuth.createResolver(async (parent, { args }) => {
      const results = await nextQuestTopic();
      return results;
    }),
  },

  Mutation: {
    createquestgame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        //deduct gems for time boost
        if (input.timer > 30000) {
          let gems = 0;
          if (input.timer === 45000) {
            gems = -5;
          }
          if (input.timer === 60000) {
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
        try {
          let catsAndQuestions;
          if (input.topictype === "Category Type") {
            catsAndQuestions = await questQuestions(
              input.topictype,
              input.cattype
            );
          } else if (input.topictype === "Category") {
            catsAndQuestions = await questQuestions(
              input.topictype,
              input.category
            );
          } else {
            catsAndQuestions = await questQuestions(
              input.topictype,
              input.genre
            );
          }
          const newgame = new GameQuest({
            createdby: user.id,
            topictype: input.topictype,
            topic: input.topic,
            players: [{ player: user.id, timer: input.timer }],
            categories: catsAndQuestions.categories,
            questions: catsAndQuestions.questions,
          });
          const newGame = await newgame.save();
          const returnedGame = await GameQuest.findOne({
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

    changequestquestion: requiresAuth.createResolver(
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
          let updatedGame = await GameQuest.findOneAndUpdate(
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

    enterquestanswer: requiresAuth.createResolver(
      async (parent, { gameid, roundresults, endgame }, { user }) => {
        try {
          //give user some gems
          let gems = 0;
          if (roundresults.points > 0) {
            gems = 1;
            if (roundresults.difficulty === "Hard") {
              gems = 3;
            }
            await User.findOneAndUpdate(
              { _id: user.id },
              { $inc: { gems } },
              { $set: { lastActiveAt: Date.now() } }
            );
          }

          //add round results
          let updatedGame = await GameQuest.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } },
              $inc: { "players.$.gems": gems },
            },
            { new: true }
          ).populate("players.player");

          if (endgame) {
            //figure out score
            const player = updatedGame.players[0];
            let points = player.roundresults
              .map((results) => results.points)
              .reduce((a, b) => a + b, 0);
            //end game
            updatedGame = await GameQuest.findOneAndUpdate(
              { _id: gameid, "players.player": user.id },
              {
                $set: { gameover: true, "players.$.score": points },
              },
              { new: true }
            ).populate("players.player");
          }
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    expirequestgame: requiresAuth.createResolver(async (parent, { gameid }) => {
      try {
        const updatedGame = await GameQuest.findOneAndUpdate(
          { _id: gameid },
          {
            $set: { expired: true },
          },
          { new: true }
        ).populate("players.player");
        return updatedGame;
      } catch (error) {
        console.error(error);
      }
    }),

    deletequestgame: requiresAdmin.createResolver(
      async (parent, { gameid }) => {
        try {
          const deletedQuestGame = await GameQuest.deleteOne({
            _id: gameid,
          });
          return deletedQuestGame;
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
