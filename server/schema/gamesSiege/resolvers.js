const GameSiege = require("../../models/GameSiege");
const User = require("../../models/User");
const { withFilter } = require("graphql-subscriptions");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");
//resolver helpers
const {
  changeSiegeTurn,
  endSiegeGame,
} = require("../_helpers/helper-gamessiege");
const { siegeQuestions } = require("../_helpers/helper-questions");
//subscriptions
const SIEGE_UPDATE = "SIEGE_UPDATE";

const resolvers = {
  Query: {
    siegegamepage: requiresAuth.createResolver(
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
          const siegegames = await Promise.all([
            GameSiege.find(queryBuilder(players, gameover))
              .sort({ createdAt: -1 })
              .skip(offset)
              .limit(limit)
              .populate("players.player"),
            GameSiege.countDocuments(queryBuilder(players, gameover)),
          ]);
          const siegeResults = siegegames[0];
          const siegeCount = siegegames[1];
          return {
            pages: Math.ceil(siegeCount / limit),
            totalrecords: siegeCount,
            siegegames: siegeResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentsiegegame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentsiegegame = await GameSiege.findOne({
            _id: id,
            "players.player": user.id,
          })
            .populate("createdby")
            .populate("players.player")
            .populate("category")
            .populate("player.questions");

          return currentsiegegame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Mutation: {
    createsiegegame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        try {
          //deduct gems for time boost
          if (input.timer > 30000) {
            let gems = 0;
            if (input.timer === 45000) {
              gems = -5;
            }
            if (input.timer === 60000) {
              gems = -10;
            }
            await User.findOneAndUpdate({ _id: user.id }, { $inc: { gems } });
          }
          //try to avoid previous questions for player and opponent
          const player = await User.findOne({ _id: user.id });
          const opponent = await User.findOne({ _id: input.opponentid });
          const userquestions = player.recentquestions.slice();
          const opponentquestions = opponent.recentquestions.slice();
          const previousquestions = userquestions.concat(
            opponentquestions.filter((item) => userquestions.indexOf(item) < 0)
          );
          const questions = await siegeQuestions(
            input.category,
            previousquestions
          );
          const newgame = new GameSiege({
            createdby: user.id,
            category: input.category,
            players: [
              {
                player: user.id,
                joined: true,
                turn: true,
                timer: input.timer,
                questions,
              },
              { player: input.opponentid, questions },
            ],
            questions,
          });
          const siegeGame = await newgame.save();
          const returnedGame = await GameSiege.findOne({
            _id: siegeGame._id,
          })
            .populate("createdby")
            .populate("players.player")
            .populate({
              path: "category",
              populate: { path: "type" },
            })
            .populate("players.questions")
            .populate("players.replacedquestions");
          return returnedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joinsiegegame: requiresAuth.createResolver(
      async (parent, { gameid, timer }, { user }) => {
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
            await User.findOneAndUpdate({ _id: user.id }, { $inc: { gems } });
          }
          const updatedGame = await GameSiege.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.joined": true,
                "players.$.timer": timer,
                accepted: true,
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("players.questions")
            .populate("players.replacedquestions");
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    declinesiegegame: requiresAuth.createResolver(
      async (parent, { gameid }) => {
        try {
          const updatedGame = await GameSiege.findOneAndUpdate(
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

    entersiegeanswerandadvance: requiresAuth.createResolver(
      async (
        parent,
        { gameid, roundresults, advance },
        { user, expo, pubsub }
      ) => {
        try {
          //first add round results
          let updatedGame = await GameSiege.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $addToSet: { "players.$.roundresults": { ...roundresults } },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("players.questions")
            .populate("players.replacedquestions");

          if (advance) {
            const player = updatedGame.players.find(
              (player) => player.player._id == user.id
            );
            const opponent = updatedGame.players.find(
              (player) => player.player._id != user.id
            );

            //either change turn or end game
            if (updatedGame.accepted) {
              //end game
              updatedGame = await endSiegeGame(
                updatedGame._id,
                player,
                opponent,
                expo
              );
              pubsub.publish(SIEGE_UPDATE, {
                siegegamesupdate: {
                  playerid: opponent.player._id,
                  updated: true,
                },
              });
            } else {
              //change turns
              updatedGame = await changeSiegeTurn(
                updatedGame._id,
                player,
                opponent,
                expo
              );
              pubsub.publish(SIEGE_UPDATE, {
                siegegamesupdate: {
                  playerid: opponent.player._id,
                  updated: true,
                },
              });
            }
          }

          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    siegeresultsseen: requiresAuth.createResolver(
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GameSiege.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.resultsseen": true } }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    expiresiegegame: requiresAuth.createResolver(async (parent, { gameid }) => {
      try {
        const updatedGame = await GameSiege.findOneAndUpdate(
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

    deletesiegegame: requiresAdmin.createResolver(
      async (parent, { gameid }) => {
        try {
          const deletedSiegeGame = await GameSiege.deleteOne({
            _id: gameid,
          });
          return deletedSiegeGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Subscription: {
    siegegamesupdate: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(SIEGE_UPDATE),
        (payload, variables) => {
          return payload.siegegamesupdate.playerid === variables.playerid;
        }
      ),
    },
  },
};

module.exports = {
  resolvers,
};
