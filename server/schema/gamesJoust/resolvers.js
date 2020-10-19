const mongoose = require("mongoose");
const GameJoust = require("../../models/GameJoust");
const User = require("../../models/User");
const { withFilter } = require("graphql-subscriptions");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");
//resolver helpers
const {
  changeJoustTurn,
  endJoustGame,
} = require("../_helpers/helper-gamesjoust");
const {
  joustQuestions,
  differentQuestion,
} = require("../_helpers/helper-questions");
//subscriptions
const USERGAMES_UPDATE = "USERGAMES_UPDATE";

const resolvers = {
  Query: {
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
            GameJoust.countDocuments(queryBuilder(players, gameover)),
          ]);
          const joustResults = joustgames[0];
          const joustCount = joustgames[1];

          return {
            pages: Math.ceil(joustCount / limit),
            totalrecords: joustCount,
            joustgames: joustResults,
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
            "players.player": user.id,
          })
            .populate("createdby")
            .populate("players.player")
            .populate({
              path: "category",
              populate: { path: "type" },
            })
            .populate("questions");

          return currentjoustgame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joustopponenthistory: requiresAuth.createResolver(
      async (_parent, { opponentid, limit, updatedAt }, { user }) => {
        const queryBuilder = (user, opponentid, updatedAt) => {
          const query = {
            $and: [
              { "players.player": user.id },
              { "players.player": opponentid },
            ],
            gameover: { $eq: true },
            timedout: { $eq: false },
          };
          if (updatedAt) {
            query.updatedAt = { $lt: new Date(Number(updatedAt)) };
          }

          return query;
        };
        try {
          let hasMore = false;
          let endedgames = await GameJoust.find(
            queryBuilder(user, opponentid, updatedAt)
          )
            .sort({ updatedAt: -1 })
            .limit(limit + 1)
            .populate("players.player")
            .populate({
              path: "category",
              populate: { path: "type" },
            });
          if (endedgames.length === limit + 1) {
            //if there are more items than the limit, trim the last item from the array and set hasMore to true
            endedgames.pop();
            hasMore = true;
          }
          return {
            items: endedgames,
            hasMore,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Mutation: {
    createjoustgame: requiresAuth.createResolver(
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
          //try to avoid previous questions for player and opponent
          const player = await User.findOne({ _id: user.id });
          const opponent = await User.findOne({ _id: input.opponentid });
          const userquestions = player.recentquestions.slice();
          const opponentquestions = opponent.recentquestions.slice();
          const previousquestions = userquestions.concat(
            opponentquestions.filter((item) => userquestions.indexOf(item) < 0)
          );
          const questions = await joustQuestions(
            input.category,
            previousquestions
          );
          //create game
          const newgame = new GameJoust({
            createdby: user.id,
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
            category: input.category,
          });
          const newGame = await newgame.save();
          const returnedGame = await GameJoust.findOne({
            _id: newGame._id,
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

    joinjoustgame: requiresAuth.createResolver(
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
          const updatedGame = await GameJoust.findOneAndUpdate(
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

    changejoustquestion: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
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
          let updatedGame = await GameJoust.findOneAndUpdate(
            { _id: input.gameid, "players.player": user.id },
            {
              $set: { "players.$.questions": slicedQuestions },
              $addToSet: { "players.$.replacedquestions": input.questionid },
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

    enterjoustanswerandadvance: requiresAuth.createResolver(
      async (
        parent,
        { gameid, roundresults, advance },
        { user, expo, pubsub }
      ) => {
        try {
          //track questions asked for last 30 jousts
          await User.findOneAndUpdate(
            { _id: user.id },
            {
              $push: {
                recentquestions: {
                  $each: [mongoose.Types.ObjectId(roundresults.question)],
                  $slice: 210,
                },
              },
            }
          );
          //add round results
          let updatedGame = await GameJoust.findOneAndUpdate(
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
              updatedGame = await endJoustGame(
                updatedGame._id,
                player,
                opponent,
                expo
              );
              await User.findOneAndUpdate(
                { _id: user.id },
                { $set: { lastActiveAt: Date.now() } }
              );
              pubsub.publish(USERGAMES_UPDATE, {
                usergamesupdate: {
                  playerid: opponent.player._id,
                  updated: true,
                },
              });
            } else {
              //change turns
              updatedGame = await changeJoustTurn(
                updatedGame._id,
                player,
                opponent,
                expo
              );
              await User.findOneAndUpdate(
                { _id: user.id },
                { $set: { lastActiveAt: Date.now() } }
              );
              pubsub.publish(USERGAMES_UPDATE, {
                usergamesupdate: {
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

    resignjoustgame: requiresAuth.createResolver(
      async (parent, { gameid }, { user, expo, pubsub }) => {
        try {
          const updatedGame = await GameJoust.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.resultsseen": true,
                "players.$.resigned": true,
              },
            },
            { new: true }
          ).populate("players.player");

          const player = updatedGame.players.find(
            (player) => player.player._id == user.id
          );

          const opponent = updatedGame.players.find(
            (player) => player.player._id != user.id
          );

          const endedGame = await endJoustGame(
            updatedGame._id,
            player,
            opponent,
            expo
          );
          await User.findOneAndUpdate(
            { _id: user.id },
            { $set: { lastActiveAt: Date.now() } }
          );
          pubsub.publish(JOUST_UPDATE, {
            joustgamesupdate: {
              playerid: opponent.player._id,
              gameadded: true,
            },
          });
          return endedGame;
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
            { $set: { "players.$.resultsseen": true } },
            { new: true }
          ).populate("players.player");
          User.findOneAndUpdate(
            { _id: user.id },
            { $set: { lastActiveAt: Date.now() } }
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
            $set: { expired: true },
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
          const deletedJoustGame = await GameJoust.deleteOne({
            _id: gameid,
          });
          return deletedJoustGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Subscription: {
    joustgamesupdate: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(JOUST_UPDATE),
        (payload, variables) => {
          return payload.joustgamesupdate.playerid === variables.playerid;
        }
      ),
    },
  },
};

module.exports = {
  resolvers,
};
