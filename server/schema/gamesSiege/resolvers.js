const GameSiege = require("../../models/GameSiege");
const CategoryType = require("../../models/CategoryType");
const CategoryGenre = require("../../models/CategoryGenre");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
} = require("../_helpers/helper-permissions");
//resolver helpers
const {
  changeSiegeTurn,
  endSiegeGame
} = require("../_helpers/helper-gamesseige");
const {
  siegeCatTypeQuestions,
  siegeGenreQuestions
} = require("../_helpers/helper-questions");

const resolvers = {
  Query: {
    siegetopics: requiresAuth.createResolver(async (parent, { args }) => {
      try {
        const types = await CategoryType.find({
          playable: { $eq: true }
        });
        const genres = await CategoryGenre.find({
          playable: { $eq: true }
        });
        return { types, genres };
      } catch (error) {
        console.error(error);
      }
    }),

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
            GameSiege.countDocuments(queryBuilder(players, gameover))
          ]);
          const siegeResults = siegegames[0];
          const siegeCount = siegegames[1];
          return {
            pages: Math.ceil(siegeCount / limit),
            totalrecords: siegeCount,
            siegegames: siegeResults
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
            "players.player": user.id
          })
            .populate("createdby")
            .populate("players.player")

            .populate({
              path: "categories",
              populate: { path: "type" }
            })
            .populate("questions");

          return currentsiegegame;
        } catch (error) {
          console.error(error);
        }
      }
    )
  },

  Mutation: {
    createsiegegame: requiresAuth.createResolver(
      async (parent, { input }, { user }) => {
        try {
          let catsAndQuestions;
          if (input.topictype === "Category Type") {
            catsAndQuestions = await siegeCatTypeQuestions(input.cattype);
          } else {
            catsAndQuestions = await siegeGenreQuestions(input.genre);
          }
          const newgame = new GameSiege({
            createdby: user.id,
            topictype: input.topictype,
            topic: input.topic,
            players: [
              {
                player: user.id,
                joined: true,
                turn: true
              },
              { player: input.opponentid }
            ],
            categories: catsAndQuestions.categories,
            questions: catsAndQuestions.questions
          });
          const siegeGame = await newgame.save();

          return siegeGame;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    joinsiegegame: requiresAuth.createResolver(
      async (parent, { gameid }, { user }) => {
        try {
          const updatedGame = await GameSiege.findOneAndUpdate(
            { _id: gameid, "players.player": user.id },
            { $set: { "players.$.joined": true, accepted: true } }
          );
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
      async (parent, { gameid, roundresults, advance }, { user, expo }) => {
        try {
          //first add round results
          let updatedGame = await GameSiege.findOneAndUpdate(
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
              updatedGame = await endSiegeGame(
                updatedGame._id,
                player,
                opponent,
                expo
              );
            } else {
              //change turns
              updatedGame = await changeSiegeTurn(
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
            $set: { expired: true }
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
            _id: gameid
          });
          return deletedSiegeGame;
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
