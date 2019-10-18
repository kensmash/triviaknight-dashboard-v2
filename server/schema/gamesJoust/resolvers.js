const GameJoust = require("../../models/GameJoust");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
} = require("../_helpers/helper-permissions");
//resolver helpers
const {
  changeJoustTurn,
  endJoustGame
} = require("../_helpers/helper-gamesjoust");
const { joustQuestions } = require("../_helpers/helper-questions");

const resolvers = {
  Query: {
    alljoustgames: async (parent, args, { user }) => {
      try {
        const alljoustgames = await GameJoust.find({
          "players.player": user.id
        })
          .populate("createdby")
          .populate("players.player")
          .populate("currentcategory");
        return alljoustgames;
      } catch (error) {
        console.error(error);
      }
    },

    joustgamepage: requiresAuth.createResolver(
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
          const joustgames = await Promise.all([
            GameJoust.find(queryBuilder(players, gameover))
              .sort({ createdAt: -1 })
              .skip(offset)
              .limit(limit)
              .populate("category")
              .populate("players.player"),
            GameJoust.find(queryBuilder(players, gameover)).count()
          ]);
          const joustResults = joustgames[0];
          const joustCount = joustgames[1];
          return {
            pages: Math.ceil(joustCount / limit),
            totalrecords: joustCount,
            joustgames: joustResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentjoustgame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentjoustgame = await GameJoust.findOne({
            _id: id,
            "players.player": user.id
          })
            .populate("createdby")
            .populate("players.player")
            .populate({
              path: "category",
              populate: { path: "type" }
            })
            .populate("questions");

          return currentjoustgame;
        } catch (error) {
          console.error(error);
        }
      }
    )
  },

  Mutation: {
    createjoustgame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        try {
          const questions = await joustQuestions(input.category);
          const newgame = new GameJoust({
            createdby: user.id,
            players: [
              {
                player: user.id,
                joined: true,
                turn: true
              },
              { player: input.opponentid }
            ],
            category: input.category,
            questions
          });
          const joustGame = await newgame.save();
          return joustGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joinjoustgame: requiresAuth.createResolver(
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GameJoust.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.joined": true, accepted: true } }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    declinejoustgame: requiresAuth.createResolver(
      async (parent, { gameid }) => {
        try {
          const updatedGame = await GameJoust.findOneAndUpdate(
            { _id: gameid },
            { $set: { declined: true, gameover: true } },
            { new: true }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    enterjoustanswerandadvance: requiresAuth.createResolver(
      async (parent, { gameid, roundresults, advance }, { user, expo }) => {
        try {
          //first add round results
          let updatedGame = await GameJoust.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } }
            },
            { new: true }
          ).populate("players.player");

          if (advance) {
            const player = updatedGame.players.find(
              player => player.player._id == user.id
            );
            const opponent = updatedGame.players.find(
              player => player.player._id != user.id
            );

            //either change turn or end game
            if (updatedGame.accepted) {
              //end game
              updatedGame = await endJoustGame(
                updatedGame._id,
                player,
                opponent,
                expo
              );
            } else {
              //change turns
              updatedGame = await changeJoustTurn(
                updatedGame._id,
                player,
                opponent,
                expo
              );
            }
          }
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joustresultsseen: requiresAuth.createResolver(
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GameJoust.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.resultsseen": true } }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    expirejoustgame: requiresAuth.createResolver(async (parent, { gameid }) => {
      try {
        const updatedGame = await GameJoust.findOneAndUpdate(
          { _id: gameid },
          {
            $set: { expired: true }
          },
          { new: true }
        ).populate("players.player");
        return updatedGame;
      } catch (error) {
        console.error(error);
      }
    }),

    deletejoustgame: requiresAdmin.createResolver(
      async (parent, { gameid }) => {
        try {
          const deletedJoustGame = await GameJoust.findByIdAndRemove({
            _id: gameid
          });
          return deletedJoustGame;
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
