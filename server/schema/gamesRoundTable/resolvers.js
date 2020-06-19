const GameRoundTable = require("../../models/GameRoundTable");
const ExpoPushTicket = require("../../models/ExpoPushTicket");
const Expo = require("expo-server-sdk");
//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//game helpers
const { gameQuestion } = require("../_helpers/helper-questions");

//subscription
const { withFilter } = require("graphql-subscriptions");

const USERGAME_ADDED = "USERGAME_ADDED";
const HOSTEDPLAYER_JOINED = "HOSTEDPLAYER_JOINED";
const CATEGORY_ADDED = "CATEGORY_ADDED";
const HOSTEDPLAYER_SELECTEDCATEGORIES = "HOSTEDPLAYER_SELECTEDCATEGORIES";
const PLAYER_REMOVED = "PLAYER_REMOVED";
const HOSTEDGAME_STARTED = "HOSTEDGAME_STARTED";
const HOSTEDGAME_UPDATED = "HOSTEDGAME_UPDATED";
const HOSTEDGAME_SHOWQUESTION = "HOSTEDGAME_SHOWQUESTION";
const HOSTEDPLAYER_UPDATED = "HOSTEDPLAYER_UPDATED";
const HOSTEDGAME_TIED = "HOSTEDGAME_TIED";
const HOSTEDGAME_OVER = "HOSTEDGAME_OVER";
const HOSTEDGAME_CANCELLED = "HOSTEDGAME_CANCELLED";

const resolvers = {
  Query: {
    currentroundtablegames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const allroundtablegames = await GameRoundTable.find({
            "players.player": user.id,
            gameover: false,
          }).populate("createdby");
          return allroundtablegames;
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
                joined: true,
              },
            ],
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
      async (
        parent,
        { gameid, players, playerExpoPushTokens },
        { user, expo, pubsub }
      ) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { players },
            },
            { new: true }
          ).populate("players.player");
          //push notifications
          //Create the messages that you want to send to clents
          let messages = [];
          const pushTokens = playerExpoPushTokens;
          for (let pushToken of pushTokens) {
            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
              console.error(
                `Push token ${pushToken} is not a valid Expo push token`
              );
              continue;
            }
            messages.push({
              to: pushToken,
              sound: "default",
              body: `${user.name} has invited you to a Hosted game!`,
              data: {
                title: "Party Game!",
                text: `${user.name} has invited you to a Hosted game!`,
                type: "HostedInvitation",
                gameid: gameid,
              },
              channelId: "game-messages",
            });
          }
          //send push notifications in chunks
          let chunks = expo.chunkPushNotifications(messages);
          //receive tickets in response
          let tickets = [];
          (async () => {
            for (let chunk of chunks) {
              try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
              } catch (error) {
                console.error(error);
              }
              //add types
              const ticketsWithTypes = tickets.map((ticket) => ({
                type: "Invite Hosted Player",
                ...ticket,
              }));
              //save tickets to database for later retrieval
              for (let ticket of ticketsWithTypes) {
                try {
                  const newticket = new ExpoPushTicket(ticket);
                  await newticket.save();
                } catch (error) {
                  console.error(error);
                }
              }
            }
          })();
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
          pubsub.publish(HOSTEDPLAYER_JOINED, {
            hostedplayerjoined: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_JOINED, {
            hostedplayerjoined: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_SELECTEDCATEGORIES, {
            playerselectedcategories: updatedGame,
          });

          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    startroundtablegame: requiresAuth.createResolver(
      async (
        parent,
        { gameid, categories, playerExpoPushTokens },
        { user, pubsub, expo }
      ) => {
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
          //push notifications
          //Create the messages that you want to send to clents
          let messages = [];
          const pushTokens = playerExpoPushTokens;
          for (let pushToken of pushTokens) {
            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken)) {
              console.error(
                `Push token ${pushToken} is not a valid Expo push token`
              );
              continue;
            }
            messages.push({
              to: pushToken,
              sound: "default",
              body: `${user.name} has started the hosted game!`,
              data: {
                title: "Hosted Game Started!",
                text: `${user.name} has started the hosted game!`,
                type: "HostedGameStart",
                gameid: updatedGame._id,
              },
              channelId: "game-messages",
            });
          }
          //send push notifications in chunks
          let chunks = expo.chunkPushNotifications(messages);
          //receive tickets in response
          let tickets = [];
          (async () => {
            for (let chunk of chunks) {
              try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
              } catch (error) {
                console.error(error);
              }
              //add types
              const ticketsWithTypes = tickets.map((ticket) => ({
                type: "Start Hosted Game",
                ...ticket,
              }));
              //save tickets to database for later retrieval
              for (let ticket of ticketsWithTypes) {
                try {
                  const newticket = new ExpoPushTicket(ticket);
                  const savedTicket = await newticket.save();
                } catch (error) {
                  console.error(error);
                }
              }
            }
          })();
          pubsub.publish(USERGAME_ADDED, {
            usergameadded: true,
          });
          pubsub.publish(HOSTEDGAME_STARTED, {
            hostedgamestarted: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    setcurrentroundtablequestion: requiresAuth.createResolver(
      async (parent, { gameid, category, previousquestions }, { pubsub }) => {
        try {
          const currentquestion = await gameQuestion(
            category,
            "Normal",
            "Multiple Choice",
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
          pubsub.publish(HOSTEDGAME_UPDATED, {
            hostedgameupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    fetchdifferentroundtablequestion: requiresAuth.createResolver(
      async (parent, { gameid, category, previousquestions }, { pubsub }) => {
        try {
          const currentquestion = await gameQuestion(
            category,
            "Normal",
            "Multiple Choice",
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
          pubsub.publish(HOSTEDGAME_UPDATED, {
            hostedgameupdated: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updatedGame,
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
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updatedGame,
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
          const removeArrayElement = await GameRoundTable.findOneAndUpdate(
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
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updateTheThings,
          });
          return updateTheThings;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    hostshowquestion: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            { $set: { showquestiontoplayers: true } },
            { new: true }
          );
          //sub
          pubsub.publish(HOSTEDGAME_SHOWQUESTION, {
            hostshowquestion: updatedGame,
          });
          return updatedGame;
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
          pubsub.publish(HOSTEDGAME_UPDATED, {
            hostedgameupdated: updatedGame,
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

    playernextround: requiresAuth.createResolver(
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
                "players.$.answerrecorded": false,
                "players.$.guessfeedbackreceived": false,
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
                hasquestion: false,
                showquestiontoplayers: false,
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
          pubsub.publish(HOSTEDGAME_UPDATED, {
            hostedgameupdated: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    setroundtabletie: requiresAuth.createResolver(
      async (parent, { gameid, playerid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: { "players.$.tied": true },
            },
            { new: true }
          ).populate("players.player");
          //sub
          pubsub.publish(HOSTEDGAME_TIED, {
            hostedgametied: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    removeroundtabletie: requiresAuth.createResolver(
      async (parent, { gameid, playerid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: { "players.$.tied": false },
            },
            { new: true }
          ).populate("players.player");
          //sub
          pubsub.publish(HOSTEDPLAYER_UPDATED, {
            hostedplayerupdated: updatedGame,
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
          pubsub.publish(HOSTEDGAME_TIED, {
            hostedgametied: updatedGame,
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
          pubsub.publish(HOSTEDGAME_OVER, {
            hostedgameover: updatedGame,
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
          pubsub.publish(HOSTEDGAME_CANCELLED, {
            hostedgamecancelled: updatedGame,
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
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDPLAYER_JOINED),
        (payload, variables) => {
          return payload.hostedplayerjoined._id === variables.gameid;
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
          pubsub.asyncIterator(HOSTEDPLAYER_SELECTEDCATEGORIES),
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
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDGAME_STARTED),
        (payload, variables) => {
          return payload.hostedgamestarted._id === variables.gameid;
        }
      ),
    },

    roundtablegameupdated: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDGAME_UPDATED),
        (payload, variables) => {
          return payload.hostedgameupdated._id === variables.gameid;
        }
      ),
    },

    hostshowquestion: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDGAME_SHOWQUESTION),
        (payload, variables) => {
          return payload.hostshowquestion._id === variables.gameid;
        }
      ),
    },

    roundtableplayerupdated: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDPLAYER_UPDATED),
        (payload, variables) => {
          return payload.hostedplayerupdated._id === variables.gameid;
        }
      ),
    },

    roundtablegametied: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDGAME_TIED),
        (payload, variables) => {
          return payload.hostedgametied._id === variables.gameid;
        }
      ),
    },

    roundtablegameover: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDGAME_OVER),
        (payload, variables) => {
          return payload.hostedgameover._id === variables.gameid;
        }
      ),
    },

    roundtablegamecancelled: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(HOSTEDGAME_CANCELLED),
        (payload, variables) => {
          return payload.hostedgamecancelled._id === variables.gameid;
        }
      ),
    },
  },
};

module.exports = {
  resolvers,
};
