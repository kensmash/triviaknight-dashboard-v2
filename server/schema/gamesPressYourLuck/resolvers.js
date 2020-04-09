const GamePressYourLuck = require("../../models/GamePressYourLuck");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");
//query helpers
const { currentPressLuckTopic } = require("../_helpers/helper-gamespressluck");
const { pressLuckQuestions } = require("../_helpers/helper-questions");

const resolvers = {
  Query: {
    pressluckgamepage: requiresAuth.createResolver(
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
          const pressluckgames = await Promise.all([
            GamePressYourLuck.find(queryBuilder(players, gameover))
              .sort({ createdAt: -1 })
              .skip(offset)
              .limit(limit)
              .populate("players.player"),
            GamePressYourLuck.find(queryBuilder(players, gameover)).count(),
          ]);
          const pressLuckResults = pressluckgames[0];
          const pressLuckCount = pressluckgames[1];
          return {
            pages: Math.ceil(pressLuckCount / limit),
            totalrecords: pressLuckCount,
            pressluckgames: pressLuckResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentpressluckgame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentpressluckgame = await GamePressYourLuck.findOne({
            _id: id,
            "players.player": user.id,
          })

            .populate("players.player")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate("questions");

          return currentpressluckgame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentpresslucktopic: requiresAuth.createResolver(
      async (parent, { args }) => {
        const results = await currentPressLuckTopic();
        return results;
      }
    ),
  },

  Mutation: {
    createpressluckgame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        try {
          let catsAndQuestions;
          if (input.topictype === "Category Type") {
            catsAndQuestions = await pressLuckQuestions(
              input.topictype,
              input.cattype
            );
          } else if (input.topictype === "Category") {
            catsAndQuestions = await pressLuckQuestions(
              input.topictype,
              input.category
            );
          } else {
            catsAndQuestions = await pressLuckQuestions(
              input.topictype,
              input.genre
            );
          }
          const newgame = new GamePressYourLuck({
            createdby: user.id,
            topictype: input.topictype,
            topic: input.topic,
            players: [{ player: user.id }],
            categories: catsAndQuestions.categories,
            questions: catsAndQuestions.questions,
          });
          const pressLuckGame = await newgame.save();
          return pressLuckGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    enterpressluckanswer: requiresAuth.createResolver(
      async (parent, { gameid, roundresults, advance }, { user }) => {
        try {
          //first add round results
          let updatedGame = await GamePressYourLuck.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } },
            },
            { new: true }
          ).populate("players.player");

          if (advance) {
            const player = updatedGame.players[0];
            let points = player.roundresults
              .map((results) => results.points)
              .reduce((a, b) => a + b, 0);
            const playerWrongAnswers = player.roundresults.filter(
              (result) => result.points === 0
            );
            if (playerWrongAnswers.length === 3) {
              points = 0;
            }
            updatedGame = await GamePressYourLuck.findOneAndUpdate(
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

    enterpressluckanswerandadvance: requiresAuth.createResolver(
      async (parent, { gameid, roundresults, advance }, { user }) => {
        try {
          //first add round results
          let updatedGame = await GamePressYourLuck.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } },
            },
            { new: true }
          ).populate("players.player");

          if (advance) {
            //figure out score
            let points = player.roundresults
              .map((results) => results.points)
              .reduce((a, b) => a + b, 0);
            //end game
            updatedGame = await GamePressYourLuck.findOneAndUpdate(
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

    endpressluckgame: requiresAuth.createResolver(
      async (parent, { gameid, points }, { user }) => {
        try {
          const endedGame = await GamePressYourLuck.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: { gameover: true, "players.$.score": points },
            },
            { new: true }
          ).populate("players.player");

          return endedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    pressluckresultsseen: requiresAuth.createResolver(
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GamePressYourLuck.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.resultsseen": true } }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    expirepressluckgame: requiresAuth.createResolver(
      async (parent, { gameid }) => {
        try {
          const updatedGame = await GamePressYourLuck.findOneAndUpdate(
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
      }
    ),

    deletepressluckgame: requiresAdmin.createResolver(
      async (parent, { gameid }) => {
        try {
          const deletedPressLuckGame = await GamePressYourLuck.deleteOne({
            _id: gameid,
          });
          return deletedPressLuckGame;
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
