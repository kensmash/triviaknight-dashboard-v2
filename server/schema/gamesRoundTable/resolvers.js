const GameRoundTable = require("../../models/GameRoundTable");
//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//game helpers
const { roundTableGameQuestion } = require("../_helpers/helper-questions");
//subscription
const { withFilter } = require("graphql-subscriptions");
const USERGAME_ADDED = "USERGAME_ADDED";
const ROUNDTABLEPLAYER_JOINED = "ROUNDTABLEPLAYER_JOINED";
const CATEGORY_ADDED = "CATEGORY_ADDED";
const ROUNDTABLEPLAYER_SELECTEDCATEGORIES =
  "ROUNDTABLEPLAYER_SELECTEDCATEGORIES";
const PLAYER_REMOVED = "PLAYER_REMOVED";
const ROUNDTABLEGAME_STARTED = "ROUNDTABLEGAME_STARTED";
const ROUNDTABLEGAME_UPDATED = "ROUNDTABLEGAME_UPDATED";
const ROUNDTABLEPLAYER_UPDATED = "ROUNDTABLEPLAYER_UPDATED";
const ROUNDTABLEGAME_TIED = "ROUNDTABLEGAME_TIED";
const ROUNDTABLEGAME_OVER = "ROUNDTABLEGAME_OVER";
const ROUNDTABLEGAME_CANCELLED = "ROUNDTABLEGAME_CANCELLED";

const resolvers = {
  Query: {
    currentroundtablegames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const allroundtablegames = await GameRoundTable.find({
            "players.player": user.id,
            gameover: false,
          })
            .populate("createdby")
            .populate("players.player")
            .populate("currentcategory");
          return allroundtablegames;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    currentroundtablegame: requiresAuth.createResolver(
      async (parent, { id }, { user }) => {
        try {
          const currentroundtablegame = await GameRoundTable.findOne({
            _id: id,
            $or: [{ "players.player": user.id }, { createdby: user.id }],
          })
            .populate("createdby")
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            })
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

          return currentroundtablegame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Mutation: {
    createroundtablegame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        try {
          const newgame = new GameRoundTable({
            createdby: user.id,
            pointsgoal: input.pointsgoal,
            categoriestype: input.categoriestype,
            categoriesperplayer: input.categoriesperplayer,
            players: [
              {
                player: user.id,
                host: true,
                joined: true,
              },
            ],
            selectedquestions: input.previousquestions
              ? input.previousquestions
              : [],
          });
          const roundTableGame = await newgame.save();
          const newRoundTableGame = await GameRoundTable.findOne({
            _id: roundTableGame._id,
          });

          return newRoundTableGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    inviteplayers: requiresAuth.createResolver(
      async (parent, { gameid, players }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $addToSet: { players },
            },
            { new: true }
          ).populate("players.player");

          pubsub.publish(USERGAME_ADDED, {
            usergameadded: true,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    removeplayer: requiresAuth.createResolver(
      async (parent, { gameid, playerid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            { $pull: { players: { player: playerid } } },
            { new: true }
          ).populate("players.player");
          //subscription
          pubsub.publish(PLAYER_REMOVED, {
            playerremoved: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joinroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.joined": true } },
            { new: true }
          ).populate("players.player");
          //subscription
          pubsub.publish(ROUNDTABLEPLAYER_JOINED, {
            roundtableplayerjoined: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    declineroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.declined": true } },
            { new: true }
          ).populate("players.player");
          //subscription
          pubsub.publish(ROUNDTABLEPLAYER_JOINED, {
            roundtableplayerjoined: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    addgamecategories: requiresAuth.createResolver(
      async (parent, { gameid, categories }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: { "players.$.hasselectedcategories": true },
              $addToSet: { categories: { $each: categories } },
              $push: { "players.$.categories": categories },
            },
            { new: true }
          )
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate("players.player");

          pubsub.publish(CATEGORY_ADDED, {
            gamecategoryadded: updatedGame,
          });
          pubsub.publish(USERGAME_ADDED, {
            usergameadded: true,
          });
          pubsub.publish(ROUNDTABLEPLAYER_SELECTEDCATEGORIES, {
            playerselectedcategories: updatedGame,
          });

          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    startroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid, categories }, { user, pubsub }) => {
        //select an initial category
        const firstCategory =
          categories[Math.floor(Math.random() * categories.length)];
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: {
                started: true,
                currentcategory: firstCategory,
                selectedcategories: [firstCategory],
              },
            },
            { new: true }
          )
            .populate("createdby")
            .populate("players.player")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("selectedcategories")
            .populate("selectedquestions");

          pubsub.publish(USERGAME_ADDED, {
            usergameadded: true,
          });
          pubsub.publish(ROUNDTABLEGAME_STARTED, {
            roundtablegamestarted: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    setcurrentroundtablequestion: requiresAuth.createResolver(
      async (parent, { gameid, catid, previousquestions }, { pubsub }) => {
        try {
          const currentquestion = await roundTableGameQuestion(
            catid,
            previousquestions
          );
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: {
                hasquestion: true,
                currentquestion,
              },
              $push: { selectedquestions: currentquestion },
            },
            { new: true }
          )
            .populate("currentquestion")
            .populate("selectedquestions")
            .populate("players.player")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            });
          //sub
          pubsub.publish(ROUNDTABLEGAME_UPDATED, {
            roundtablegameupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    fetchdifferentroundtablequestion: requiresAuth.createResolver(
      async (parent, { gameid, catid, previousquestions }, { pubsub }) => {
        try {
          const currentquestion = await roundTableGameQuestion(
            catid,
            previousquestions
          );
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { currentquestion },
              $push: { selectedquestions: currentquestion },
              $inc: { differentquestionfetchedcount: 1 },
            },
            { new: true }
          )
            .populate("currentquestion")
            .populate("players.player")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            });
          //sub
          pubsub.publish(ROUNDTABLEGAME_UPDATED, {
            roundtablegameupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    setplayeranswermode: requiresAuth.createResolver(
      async (parent, { gameid, answermode }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.answermode": answermode } },
            { new: true }
          )
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            });
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    resetplayerresponse: requiresAuth.createResolver(
      async (parent, { gameid, playerid }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: {
                "players.$.answermode": "null",
                "players.$.answered": false,
                "players.$.correct": false,
                "players.$.answer": "",
                "players.$.guessfeedbackreceived": false,
              },
            },
            { new: true }
          ).populate("players.player");

          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    removeplayerroundresults: requiresAuth.createResolver(
      async (parent, { gameid, playerid, score }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $pop: {
                "players.$.roundresults": 1,
              },
              $set: {
                "players.$.answerrecorded": false,
                "players.$.score": score,
              },
            },
            { new: true }
          ).populate("players.player");
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    playerenterguess: requiresAuth.createResolver(
      async (parent, { gameid, guess }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.answered": true,
                "players.$.answer": guess,
                lastplayed: new Date(),
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            });
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    playerentermultchoice: requiresAuth.createResolver(
      async (parent, { gameid, answer, roundresults }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.answered": true,
                "players.$.answer": answer,
                "players.$.correct": roundresults.points === 0 ? false : true,
                "players.$.answerrecorded": true,
                lastplayed: new Date(),
              },
              $inc: { "players.$.score": roundresults.points },
              $push: {
                "players.$.roundresults": {
                  ...roundresults,
                  answertype: "multiple choice",
                },
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            });
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    hostenterguess: requiresAuth.createResolver(
      async (parent, { gameid, playerid, roundresults }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: {
                "players.$.answerrecorded": true,
                "players.$.correct": roundresults.points === 0 ? false : true,
                lastplayed: new Date(),
              },
              $inc: { "players.$.score": roundresults.points },
              $push: {
                "players.$.roundresults": {
                  ...roundresults,
                  answertype: "guess",
                },
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            });
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    hostupdateguess: requiresAuth.createResolver(
      async (
        parent,
        { gameid, playerid, score, correct, roundresults },
        { pubsub }
      ) => {
        try {
          //first remove last element in round results array
          await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $pop: { "players.$.roundresults": 1 },
            }
          );
          //then perform the updates
          const updateTheThings = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: {
                "players.$.correct": correct ? true : false,
                "players.$.score": score,
                lastplayed: new Date(),
              },
              $push: {
                "players.$.roundresults": {
                  ...roundresults,
                  answertype: "guess",
                },
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            });
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updateTheThings,
          });
          return updateTheThings;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    hostshowanswer: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            { $set: { showanswertoplayers: true } },
            { new: true }
          )
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            })
            .populate("currentquestion")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            });
          //sub
          pubsub.publish(ROUNDTABLEGAME_UPDATED, {
            roundtablegameupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    playerreceiveguessfeedback: requiresAuth.createResolver(
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.guessfeedbackreceived": true,
              },
            },
            { new: true }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    gamenextround: requiresAuth.createResolver(
      async (parent, { gameid, category, tiebreakerround }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: {
                "players.$[].answermode": "null",
                "players.$[].answered": false,
                "players.$[].correct": false,
                "players.$[].answer": "",
                "players.$[].answerrecorded": false,
                "players.$[].guessfeedbackreceived": false,
                hasquestion: false,
                showanswertoplayers: false,
                currentcategory: category,
                differentquestionfetchedcount: 0,
                tiebreakerround: tiebreakerround,
              },
              $push: { selectedcategories: category },
              $inc: { currentround: 1 },
            },
            { new: true }
          )
            .populate("createdby")
            .populate("players.player")
            .populate({
              path: "players.roundresults.question",
            })
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("selectedcategories");
          //sub
          pubsub.publish(ROUNDTABLEGAME_UPDATED, {
            roundtablegameupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    setroundtablewinner: requiresAuth.createResolver(
      async (parent, { gameid, playerid }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: { "players.$.winner": true },
            },
            { new: true }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    tieroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { showanswertoplayers: false, tied: true },
            },
            { new: true }
          ).populate("players.player");

          //sub
          pubsub.publish(ROUNDTABLEGAME_TIED, {
            roundtablegametied: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    endroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { gameover: true, endeddate: new Date() },
            },
            { new: true }
          ).populate("players.player");
          //sub
          pubsub.publish(ROUNDTABLEGAME_OVER, {
            roundtablegameover: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    roundtableresultsseen: requiresAuth.createResolver(
      (parent, { gameid }, { user }) => {
        return hostedResultsSeen(gameid, user.id);
      }
    ),

    cancelroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { cancelled: true, endeddate: new Date() },
            },
            { new: true }
          ).populate("createdby");
          //subscription
          pubsub.publish(ROUNDTABLEGAME_CANCELLED, {
            roundtablegamecancelled: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Subscription: {
    roundtableplayerjoined: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEPLAYER_JOINED),
        (payload, variables) => {
          return payload.roundtableplayerjoined._id === variables.gameid;
        }
      ),
    },

    gamecategoryadded: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(CATEGORY_ADDED),
        (payload, variables) => {
          return payload.gamecategoryadded._id === variables.gameid;
        }
      ),
    },

    playerselectedcategories: {
      subscribe: withFilter(
        (_, __, { pubsub }) =>
          pubsub.asyncIterator(ROUNDTABLEPLAYER_SELECTEDCATEGORIES),
        (payload, variables) => {
          return payload.playerselectedcategories._id === variables.gameid;
        }
      ),
    },

    playerremoved: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PLAYER_REMOVED),
        (payload, variables) => {
          return payload.playerremoved._id === variables.gameid;
        }
      ),
    },

    roundtablegamestarted: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEGAME_STARTED),
        (payload, variables) => {
          return payload.roundtablegamestarted._id === variables.gameid;
        }
      ),
    },

    roundtablegameupdated: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEGAME_UPDATED),
        (payload, variables) => {
          return payload.roundtablegameupdated._id === variables.gameid;
        }
      ),
    },

    roundtableplayerupdated: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEPLAYER_UPDATED),
        (payload, variables) => {
          return payload.roundtableplayerupdated._id === variables.gameid;
        }
      ),
    },

    roundtablegametied: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEGAME_TIED),
        (payload, variables) => {
          return payload.roundtablegametied._id === variables.gameid;
        }
      ),
    },

    roundtablegameover: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEGAME_OVER),
        (payload, variables) => {
          return payload.roundtablegameover._id === variables.gameid;
        }
      ),
    },

    roundtablegamecancelled: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(ROUNDTABLEGAME_CANCELLED),
        (payload, variables) => {
          return payload.roundtablegamecancelled._id === variables.gameid;
        }
      ),
    },
  },
};

module.exports = {
  resolvers,
};