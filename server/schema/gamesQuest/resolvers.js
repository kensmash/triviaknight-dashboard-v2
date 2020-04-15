const GameQuest = require("../../models/GameQuest");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");
//query helpers
const { currentQuestTopic } = require("../_helpers/helper-gamesquest");
const { questQuestions } = require("../_helpers/helper-questions");

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

    currentquesttopic: requiresAuth.createResolver(async (parent, { args }) => {
      const results = await currentQuestTopic();
      return results;
    }),
  },

  Mutation: {
    createquestgame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
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
            players: [{ player: user.id }],
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

    enterquestanswer: requiresAuth.createResolver(
      async (parent, { gameid, roundresults, endgame }, { user }) => {
        try {
          //first add round results
          let updatedGame = await GameQuest.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } },
              $set: { "players.$.advantages": [] },
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
