const GameRoundTable = require("../../models/GameRoundTable");
const Category = require("../../models/Category");
const User = require("../../models/User");
//auth helpers
const { requiresAuth } = require("../_helpers/helper-permissions");
//game helpers
const { roundTableGameQuestion } = require("../_helpers/helper-questions");
//subscription
const { withFilter } = require("graphql-subscriptions");
const USERGAMES_UPDATE = "USERGAMES_UPDATE";
const ROUNDTABLEPLAYER_JOINED = "ROUNDTABLEPLAYER_JOINED";
const CATEGORY_ADDED = "CATEGORY_ADDED";
const ROUNDTABLEPLAYER_SELECTEDCATEGORIES =
  "ROUNDTABLEPLAYER_SELECTEDCATEGORIES";
const PLAYER_LEFT = "PLAYER_LEFT";
const PLAYER_REMOVED = "PLAYER_REMOVED";
const ROUNDTABLEGAME_STARTED = "ROUNDTABLEGAME_STARTED";
const ROUNDTABLEGAME_DIFFERENTQUESTIONFETCHED =
  "ROUNDTABLEGAME_DIFFERENTQUESTIONFETCHED";
const ROUNDTABLEGAME_UPDATED = "ROUNDTABLEGAME_UPDATED";
const ROUNDTABLEPLAYER_UPDATED = "ROUNDTABLEPLAYER_UPDATED";
const ROUNDTABLEGAME_OVER = "ROUNDTABLEGAME_OVER";
const ROUNDTABLEGAME_CANCELLED = "ROUNDTABLEGAME_CANCELLED";

const resolvers = {
  Query: {
    currentroundtablegames: requiresAuth.createResolver(
      async (parent, args, { user }) => {
        try {
          const allroundtablegames = await GameRoundTable.find({
            "players.player": user.id,
          })
            .populate("createdby")
            .populate("players.player")
            .populate("players.categories")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("savedcategory")
            .populate("currentquestion")
            .populate("selectedcategories")
            .populate("selectedquestions")
            .populate("gameroundresults.host")
            .populate("gameroundresults.players.player")
            .sort({ updatedAt: -1 })
            .limit(12);
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
            .populate("players.categories")
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("savedcategory")
            .populate("currentquestion")
            .populate("selectedcategories")
            .populate("selectedquestions")
            .populate("gameroundresults.host")
            .populate("gameroundresults.players.player");
          return currentroundtablegame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    endedroundtablegames: async (_parent, { limit, updatedAt }, { user }) => {
      const queryBuilder = (user, updatedAt) => {
        const query = {
          "players.player": user.id,
          gameover: true,
          cancelled: false,
        };
        if (updatedAt) {
          query.updatedAt = { $lt: new Date(Number(updatedAt)) };
        }
        return query;
      };
      try {
        let hasMore = false;
        let endedgames = await GameRoundTable.find(
          queryBuilder(user, updatedAt)
        )
          .sort({ updatedAt: -1 })
          .limit(limit + 1)
          .populate("createdby")
          .populate("selectedquestions");
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
    },
  },

  Mutation: {
    createroundtablegame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        try {
          const newgame = new GameRoundTable({
            createdby: user.id,
            title: input.title,
            difficulty: input.difficulty,
            pointsgoal: input.pointsgoal,
            categoriestype: input.categoriestype,
            categoriesperplayer: input.categoriesperplayer,
            savedcategory: null,
            players: [
              {
                player: user.id,
                host: true,
                joined: true,
                started: true,
              },
            ],
            selectedquestions: input.previousquestions
              ? input.previousquestions
              : [],
            gameroundresults: [],
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

          players.forEach((player) =>
            pubsub.publish(USERGAMES_UPDATE, {
              usergamesupdate: {
                playerid: player.player,
                updated: true,
              },
            })
          );

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
          )
            .populate("players.player")
            .populate("players.categories");
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

    playerleavegame: requiresAuth.createResolver(
      async (parent, { gameid }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.leftgame": true } },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories");
          //subscription
          pubsub.publish(PLAYER_LEFT, {
            playerleft: updatedGame,
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
            .populate("players.player")
            .populate("players.categories");

          pubsub.publish(CATEGORY_ADDED, {
            gamecategoryadded: updatedGame,
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

    selectcategoriestypeid: requiresAuth.createResolver(
      async (_parent, { gameid, categoriestypename, categoriestypeid }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { categoriestypename, categoriestypeid },
            },
            { new: true }
          );

          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    startroundtablegame: requiresAuth.createResolver(
      async (_parent, { input }, { pubsub }) => {
        //get categories and adds them to game if categoriestype is not players
        let fetchedCategories = [];
        if (input.categoriestype !== "players") {
          if (input.categoriestype === "genre") {
            //fetch all published cats in the genre
            //then add those cats to game
            try {
              fetchedCategories = await Category.find({
                published: { $eq: true },
                genres: { $in: input.categoriestypeid },
              }).distinct("_id");
              await GameRoundTable.findOneAndUpdate(
                { _id: input.gameid },
                {
                  $set: { categories: fetchedCategories },
                }
              );
            } catch (error) {
              console.error(error);
            }
          } else {
            //fetch all published cats in the type
            //then add those cats to game
            try {
              fetchedCategories = await Category.find({
                published: { $eq: true },
                type: { $eq: input.categoriestypeid },
              }).distinct("_id");
              await GameRoundTable.findOneAndUpdate(
                { _id: input.gameid },
                {
                  $set: { categories: fetchedCategories },
                }
              );
            } catch (error) {
              console.error(error);
            }
          }
        }
        //select an initial category
        let firstCategory;
        if (input.categoriestype !== "players") {
          firstCategory =
            fetchedCategories[
              Math.floor(Math.random() * fetchedCategories.length)
            ];
        } else {
          firstCategory =
            input.categories[
              Math.floor(Math.random() * input.categories.length)
            ];
        }

        const currentquestion = await roundTableGameQuestion(
          firstCategory,
          input.difficulty,
          input.previousquestions
        );

        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: input.gameid },
            {
              $set: {
                started: true,
                currentcategory: firstCategory,
                selectedcategories: [firstCategory],
                currentquestion,
              },
              $push: { selectedquestions: currentquestion },
            },
            { new: true }
          )
            .populate("createdby")
            .populate("players.player")
            .populate("players.categories")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate({
              path: "categories",
              populate: { path: "type" },
            })
            .populate("selectedcategories")
            .populate("currentquestion")
            .populate("selectedquestions");

          //sub
          pubsub.publish(ROUNDTABLEGAME_STARTED, {
            roundtablegamestarted: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    fetchdifferentroundtablequestion: requiresAuth.createResolver(
      async (
        parent,
        { gameid, catid, difficulty, previousquestions },
        { pubsub }
      ) => {
        try {
          const currentquestion = await roundTableGameQuestion(
            catid,
            difficulty,
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
            })
            .populate("selectedquestions");

          //sub
          pubsub.publish(ROUNDTABLEGAME_DIFFERENTQUESTIONFETCHED, {
            roundtabledifferentquestionfetched: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    questionpointsadvantage: requiresAuth.createResolver(
      async (parent, { gameid, points }, { user }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.extrapointsadvantage": points } },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories");

          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    stealpointsadvantage: requiresAuth.createResolver(
      async (parent, { gameid, leader }, { user, pubsub }) => {
        try {
          await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": leader },
            { $inc: { "players.$.score": -3 } }
          );

          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $inc: { "players.$.score": 3 } },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories");

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

    skiphosting: requiresAuth.createResolver(
      async (_parent, { gameid, nexthostid }, { user }) => {
        try {
          await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.host": "false",
              },
            }
          );

          const updatedGameHost = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": nexthostid },
            {
              $set: {
                "players.$.host": "true",
                "players.$.hasskippedhosting": "true",
              },
            },
            { new: true }
          )
            .populate("createdby")
            .populate("players.player")
            .populate("players.categories");

          return updatedGameHost;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    savecategory: requiresAuth.createResolver(
      async (_parent, { gameid, savedcategory, newcategory }, { user }) => {
        try {
          const updatedGameHost = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.hassavedcategory": "true",
              },
            },
            { new: true }
          ).populate("selectedquestions");

          const newquestion = await roundTableGameQuestion(
            newcategory,
            updatedGameHost.difficulty,
            updatedGameHost.selectedquestions.map((question) => {
              return question._id;
            })
          );
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: {
                currentcategory: newcategory,
                savedcategory,
                currentquestion: newquestion,
              },
              $push: { selectedquestions: newquestion },
            },
            { new: true }
          )
            .populate("currentquestion")
            .populate("players.player")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("savedcategory")
            .populate("selectedquestions");

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
            .populate("players.categories");
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
          )
            .populate("players.player")
            .populate("players.categories");
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
          )
            .populate("players.player")
            .populate("players.categories");
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
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories");
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
            .populate("players.categories");

          //reset player points advantage
          const player = updatedGame.players.find(
            (player) => player.player._id == user.id
          );

          if (player.extrapointsadvantage > 0 && roundresults.points > 0) {
            await GameRoundTable.findOneAndUpdate(
              { _id: gameid, "players.player": user.id },
              {
                $set: {
                  "players.$.extrapointsadvantage": 0,
                },
              }
            );
          }

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

    playertimedout: requiresAuth.createResolver(
      async (parent, { gameid, roundresults }, { user, pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            {
              $set: {
                "players.$.answermode": "timedout",
                "players.$.answered": true,
                "players.$.answer": "Timed Out",
                "players.$.correct": 0,
                "players.$.answerrecorded": true,
              },
              $inc: { "players.$.score": roundresults.points },
              $push: {
                "players.$.roundresults": {
                  ...roundresults,
                  answertype: "timed out",
                },
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories");
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
              },
              $inc: { "players.$.score": roundresults.points },
              $addToSet: {
                "players.$.roundresults": {
                  ...roundresults,
                  answertype: "guess",
                },
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories");
          //sub
          pubsub.publish(ROUNDTABLEPLAYER_UPDATED, {
            roundtableplayerupdated: updatedGame,
          });

          //reset player points advantage
          const player = updatedGame.players.find(
            (player) => player.player._id == playerid
          );

          if (player.extrapointsadvantage > 0 && roundresults.points > 0) {
            await GameRoundTable.findOneAndUpdate(
              { _id: gameid, "players.player": playerid },
              {
                $set: {
                  "players.$.extrapointsadvantage": 0,
                },
              }
            );
          }
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
          const updatedGame = await GameRoundTable.findOneAndUpdate(
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
            .populate("players.categories");

          //reset player points advantage
          const player = updatedGame.players.find(
            (player) => player.player._id == playerid
          );

          if (player.extrapointsadvantage > 0 && correct) {
            await GameRoundTable.findOneAndUpdate(
              { _id: gameid, "players.player": playerid },
              {
                $set: {
                  "players.$.extrapointsadvantage": 0,
                },
              }
            );
          }

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

    hostshowquestion: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            { $set: { showquestiontoplayers: true } },
            { new: true }
          )
            .populate("players.player")
            .populate("currentquestion")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("selectedquestions");
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

    hostshowanswer: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            { $set: { showanswertoplayers: true } },
            { new: true }
          )
            .populate("players.player")
            .populate("currentquestion")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("selectedquestions");
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
          ).populate("players.player");
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    gamenextround: requiresAuth.createResolver(
      async (
        _parent,
        {
          gameid,
          category,
          difficulty,
          previousquestions,
          nexthostid,
          gameroundresults,
        },
        { pubsub }
      ) => {
        try {
          const currentquestion = await roundTableGameQuestion(
            category,
            difficulty,
            previousquestions
          );
          await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: {
                "players.$[].answermode": "null",
                "players.$[].answered": false,
                "players.$[].correct": false,
                "players.$[].host": false,
                "players.$[].answer": "",
                "players.$[].answerrecorded": false,
                "players.$[].guessfeedbackreceived": false,
                showquestiontoplayers: false,
                showanswertoplayers: false,
                currentcategory: category,
                currentquestion,
                differentquestionfetchedcount: 0,
                savedcategory: null,
              },
              $push: {
                selectedcategories: category,
                selectedquestions: currentquestion,
              },
              $addToSet: {
                gameroundresults: gameroundresults,
              },
              $inc: { currentround: 1 },
            },
            { new: true }
          );

          const updatedGameHost = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": nexthostid },
            {
              $set: {
                "players.$.host": "true",
              },
            },
            { new: true }
          )
            .populate("createdby")
            .populate("players.player")
            .populate("players.categories")
            .populate({
              path: "currentcategory",
              populate: { path: "type" },
            })
            .populate("selectedcategories")
            .populate("currentquestion")
            .populate("selectedquestions")
            .populate("gameroundresults.host")
            .populate("gameroundresults.players.player");
          //sub
          pubsub.publish(ROUNDTABLEGAME_UPDATED, {
            roundtablegameupdated: updatedGameHost,
          });
          return updatedGameHost;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    winroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid, playerid, gameroundresults }, { pubsub }) => {
        try {
          //award user gems for the win
          await User.findOneAndUpdate({ _id: playerid }, { $inc: { gems: 5 } });
          //update game
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: { "players.$.winner": true, gameover: true },
              $addToSet: {
                gameroundresults: gameroundresults,
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("players.categories")
            .populate("gameroundresults.host")
            .populate("gameroundresults.players.player");
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

    tieroundtableplayer: requiresAuth.createResolver(
      async (parent, { gameid, playerid }) => {
        try {
          //award user gems for the tie
          await User.findOneAndUpdate({ _id: playerid }, { $inc: { gems: 2 } });
          //update the game
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": playerid },
            {
              $set: { "players.$.tied": true },
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
      async (parent, { gameid, gameroundresults }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { tied: true, gameover: true },
              $addToSet: {
                gameroundresults: gameroundresults,
              },
            },
            { new: true }
          )
            .populate("players.player")
            .populate("gameroundresults.host")
            .populate("gameroundresults.players.player");
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
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.resultsseen": true } },
            { new: true }
          );
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    cancelroundtablegame: requiresAuth.createResolver(
      async (parent, { gameid }, { pubsub }) => {
        try {
          const updatedGame = await GameRoundTable.findOneAndUpdate(
            { _id: gameid },
            {
              $set: { cancelled: true, gameover: true },
            },
            { new: true }
          ).populate("players.player");
          //subscription
          pubsub.publish(ROUNDTABLEGAME_OVER, {
            roundtablegameover: updatedGame,
          });
          return updatedGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },

  Subscription: {
    usergameadded: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(USERGAME_ADDED),
        (payload, variables) => {
          return payload.usergameadded.playerids.some(
            (player) => player === variables.playerid
          );
        }
      ),
    },

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

    playerleft: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(PLAYER_LEFT),
        (payload, variables) => {
          return payload.playerleft._id === variables.gameid;
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

    roundtabledifferentquestionfetched: {
      subscribe: withFilter(
        (_, __, { pubsub }) =>
          pubsub.asyncIterator(ROUNDTABLEGAME_DIFFERENTQUESTIONFETCHED),
        (payload, variables) => {
          return (
            payload.roundtabledifferentquestionfetched._id === variables.gameid
          );
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
