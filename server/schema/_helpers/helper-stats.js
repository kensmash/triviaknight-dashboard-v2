const mongoose = require("mongoose");
const User = require("../../models/User");
const GameJoust = require("../../models/GameJoust");
const GameSiege = require("../../models/GameSiege");
const GamePressYourLuck = require("../../models/GamePressYourLuck");
const CategoryGenre = require("../../models/CategoryGenre");
const { currentPressLuckTopic } = require("../_helpers/helper-gamespressluck");

//tracks questions answered, correct and incorrect per game type
const gameStats = async userId => {
  try {
    const gamestats = await User.aggregate([
      //match user
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      //find all games user is in
      {
        $lookup: {
          from: "gamessolo",
          localField: "_id",
          foreignField: "players.player",
          as: "soloGames"
        }
      },
      {
        $lookup: {
          from: "gamesjoust",
          localField: "_id",
          foreignField: "players.player",
          as: "joustGames"
        }
      },
      {
        $lookup: {
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames"
        }
      },
      //combine games
      {
        $project: {
          totalGames: {
            $concatArrays: ["$soloGames", "$joustGames", "$siegeGames"]
          }
        }
      },
      //get a document for each game
      { $unwind: "$totalGames" },
      //get a document for each player
      { $unwind: "$totalGames.players" },
      //retain game type and player info
      {
        $project: {
          type: "$totalGames.type",
          stats: "$totalGames.players"
        }
      },
      //only keep current player documents
      { $match: { "stats.player": new mongoose.Types.ObjectId(userId) } },
      //get a document for each round result
      { $unwind: "$stats.roundresults" },
      //keep type, figure out questions answered and number correct per game type
      {
        $project: {
          type: "$type",
          stats: "$stats",
          results: "$stats.roundresults"
        }
      },
      //group by game type
      {
        $group: {
          _id: { type: "$type" },
          questionsAnswered: { $sum: 1 },
          averagescore: { $avg: "$stats.score" },
          correctAnswers: {
            $sum: {
              $cond: ["$results.correct", 1, 0]
            }
          },
          incorrectAnswers: {
            $sum: {
              $cond: ["$results.correct", 0, 1]
            }
          },
          normalquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Normal"] }, 1, 0]
            }
          },
          normalcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Normal"] },
                    { $eq: ["$results.correct", true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          hardquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Hard"] }, 1, 0]
            }
          },
          hardcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Hard"] },
                    { $eq: ["$results.correct", true] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      //the final data
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          averagescore: "$averagescore",
          questionsanswered: "$questionsAnswered",
          correctanswers: "$correctAnswers",
          incorrectanswers: "$incorrectAnswers",
          normalquestions: "$normalquestions",
          normalcorrect: "$normalcorrect",
          hardquestions: "$hardquestions",
          hardcorrect: "$hardcorrect"
        }
      }
    ]);
    return gamestats;
  } catch (error) {
    console.error(error);
  }
};

//tracks questions answered, correct and incorrect per category
const categoryStats = async userId => {
  //tracks
  try {
    const categorystats = await User.aggregate([
      //match user
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      //find all games the user is in
      {
        $lookup: {
          from: "gamessolo",
          localField: "_id",
          foreignField: "players.player",
          as: "soloGames"
        }
      },
      {
        $lookup: {
          from: "gamesjoust",
          localField: "_id",
          foreignField: "players.player",
          as: "joustGames"
        }
      },
      {
        $lookup: {
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames"
        }
      },
      //combine games
      {
        $project: {
          totalGames: {
            $concatArrays: ["$soloGames", "$joustGames", "$siegeGames"]
          }
        }
      },

      //get a document for each game
      { $unwind: "$totalGames" },
      //get a document for each player in each game
      { $unwind: "$totalGames.players" },
      //only keep player stats and round results from each document
      {
        $project: {
          stats: "$totalGames.players",
          results: "$totalGames.players.roundresults"
        }
      },
      //only keep current player documents
      { $match: { "stats.player": new mongoose.Types.ObjectId(userId) } },
      //get a document per each round result
      { $unwind: "$results" },
      //group by category
      {
        $group: {
          _id: { category: "$results.category" },
          questionsanswered: { $sum: 1 },
          correct: {
            $sum: {
              $cond: ["$results.correct", 1, 0]
            }
          },
          incorrect: {
            $sum: {
              $cond: ["$results.correct", 0, 1]
            }
          },
          normalquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Normal"] }, 1, 0]
            }
          },
          normalcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Normal"] },
                    { $eq: ["$results.correct", true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          hardquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Hard"] }, 1, 0]
            }
          },
          hardcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Hard"] },
                    { $eq: ["$results.correct", true] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      //get category info from reference
      {
        $lookup: {
          from: "categories",
          localField: "_id.category",
          foreignField: "_id",
          as: "category"
        }
      },
      //shape the cat data
      {
        $project: {
          _id: 0,
          categoryid: { $arrayElemAt: ["$category._id", 0] },
          categoryname: { $arrayElemAt: ["$category.name", 0] },
          categorytype: { $arrayElemAt: ["$category.type", 0] },
          categorypublished: { $arrayElemAt: ["$category.published", 0] },
          partycategory: { $arrayElemAt: ["$category.partycategory", 0] },
          questionsanswered: "$questionsanswered",
          correct: 1,
          incorrect: 1,
          normalquestions: "$normalquestions",
          normalcorrect: "$normalcorrect",
          hardquestions: "$hardquestions",
          hardcorrect: "$hardcorrect"
        }
      },
      //only keep published and non-party cats
      {
        $match: {
          categorypublished: { $eq: true },
          partycategory: { $eq: false }
        }
      },
      //get cat type icon
      {
        $lookup: {
          from: "categorytypes",
          localField: "categorytype",
          foreignField: "_id",
          as: "categorytype"
        }
      },
      //the final data
      {
        $project: {
          _id: 0,
          categoryid: "$categoryid",
          categoryname: "$categoryname",
          categorytypeicon: { $arrayElemAt: ["$categorytype.iconname", 0] },
          questionsanswered: "$questionsanswered",
          correct: "$correct",
          incorrect: "$incorrect",
          percentcorrect: {
            $trunc: {
              $multiply: [{ $divide: ["$correct", "$questionsanswered"] }, 100]
            }
          },
          normalquestions: "$normalquestions",
          normalcorrect: "$normalcorrect",
          hardquestions: "$hardquestions",
          hardcorrect: "$hardcorrect"
        }
      }
    ]);
    return categorystats;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of siege games, wins, losses and ties per opponent
const siegeGameStats = async userId => {
  try {
    const siegestats = await GameSiege.aggregate([
      //find all games the user is in
      {
        $match: {
          "players.player": new mongoose.Types.ObjectId(userId),
          gameover: true,
          timedout: false
        }
      },
      //get a document for each game player
      { $unwind: "$players" },
      //only use opponent documents
      {
        $match: {
          "players.player": { $nin: [new mongoose.Types.ObjectId(userId)] }
        }
      },
      //group documents by opponent
      {
        $group: {
          _id: {
            opponent: "$players.player"
          },
          totalGames: { $sum: 1 },
          //we are checking opponent docs, so a win for them is a loss for us
          losses: {
            $sum: { $cond: [{ $eq: ["$players.winner", true] }, 1, 0] }
          },
          wins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$players.winner", false] },
                    { $eq: ["$players.tied", false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          ties: { $sum: { $cond: [{ $eq: ["$players.tied", true] }, 1, 0] } }
        }
      },
      //get opponent info from reference
      {
        $lookup: {
          from: "users",
          localField: "_id.opponent",
          foreignField: "_id",
          as: "opponent"
        }
      },
      //the final data
      {
        $project: {
          _id: 0,
          opponentid: { $arrayElemAt: ["$opponent._id", 0] },
          opponentname: { $arrayElemAt: ["$opponent.name", 0] },
          opponentavatar: { $arrayElemAt: ["$opponent.avatar", 0] },
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties"
        }
      }
    ]);
    return siegestats;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of joust games, wins, losses and ties per opponent
const joustGameStats = async userId => {
  try {
    const jouststats = await GameJoust.aggregate([
      //find all games the user is in
      {
        $match: {
          "players.player": new mongoose.Types.ObjectId(userId),
          gameover: true,
          timedout: false
        }
      },
      //get a document for each game player
      { $unwind: "$players" },
      //only use opponent documents
      {
        $match: {
          "players.player": { $nin: [new mongoose.Types.ObjectId(userId)] }
        }
      },
      //group documents by opponent
      {
        $group: {
          _id: {
            opponent: "$players.player"
          },
          totalGames: { $sum: 1 },
          //we are checking opponent docs, so a win for them is a loss for us
          losses: {
            $sum: { $cond: [{ $eq: ["$players.winner", true] }, 1, 0] }
          },
          wins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$players.winner", false] },
                    { $eq: ["$players.tied", false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          ties: { $sum: { $cond: [{ $eq: ["$players.tied", true] }, 1, 0] } }
        }
      },
      //get opponent info from reference
      {
        $lookup: {
          from: "users",
          localField: "_id.opponent",
          foreignField: "_id",
          as: "opponent"
        }
      },
      //the final data
      {
        $project: {
          _id: 0,
          opponentid: { $arrayElemAt: ["$opponent._id", 0] },
          opponentname: { $arrayElemAt: ["$opponent.name", 0] },
          opponentavatar: { $arrayElemAt: ["$opponent.avatar", 0] },
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties"
        }
      }
    ]);
    return jouststats;
  } catch (error) {
    console.error(error);
  }
};

//tracks press your luck games per genre
const pressLuckGameStats = async () => {
  //const genre = await CategoryGenre.findOne({ pressluckactive: { $eq: true } });
  const currentTopic = await currentPressLuckTopic();
  let thisWeek = new Date();
  const currentDay = thisWeek.getDay();
  thisWeek.setDate(
    thisWeek.getDate() - currentDay + (currentDay == 0 ? -6 : 1)
  );
  try {
    const luckstats = await GamePressYourLuck.aggregate([
      //find all games of genre within past week
      {
        $match: {
          createdAt: { $gt: thisWeek },
          topic: { $eq: mongoose.Types.ObjectId(currentTopic.id) },
          gameover: true,
          timedout: false
        }
      },
      //get a document for each game player
      { $unwind: "$players" },
      //group documents by player
      {
        $group: {
          _id: {
            player: "$players.player"
          },
          totalGames: { $sum: 1 },
          highScore: { $max: "$players.score" }
        }
      },

      //get player info from reference
      {
        $lookup: {
          from: "users",
          localField: "_id.player",
          foreignField: "_id",
          as: "player"
        }
      },
      //the final data
      {
        $project: {
          _id: 0,
          topic: currentTopic.topic,
          id: { $arrayElemAt: ["$player._id", 0] },
          name: { $arrayElemAt: ["$player.name", 0] },
          rank: { $arrayElemAt: ["$player.rank", 0] },
          avatar: { $arrayElemAt: ["$player.avatar", 0] },
          gamesplayed: "$totalGames",
          highscore: "$highScore"
        }
      },
      { $sort: { highscore: -1 } }
    ]);
    return luckstats;
  } catch (error) {
    console.error(error);
  }
};

//press your luck last week winner
const pressLuckLastWeekWinners = async () => {
  let thisWeek = new Date();
  const currentDay = thisWeek.getDay();
  thisWeek.setDate(
    thisWeek.getDate() - currentDay + (currentDay == 0 ? -6 : 1)
  );
  var lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 16);
  try {
    let results = [];
    const winners = await User.find({
      "pressluckhighscores.date": { $gte: thisWeek }
    });
    if (winners.length) {
      results = winners.map(winner => {
        const lasthighscore =
          winner.pressluckhighscores[winner.pressluckhighscores.length - 1];
        return {
          topic: lasthighscore.topic,
          id: winner._id,
          name: winner.name,
          rank: winner.rank,
          avatar: winner.avatar,
          highscore: lasthighscore.score
        };
      });
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

//press your luck all time winners
const pressLuckAllTimeWinners = async () => {
  try {
    let results = [];
    const winners = await User.find({
      "pressluckhighscores.date": { $exists: true }
    });
    if (winners.length) {
      results = winners.map(winner => {
        return {
          id: winner._id,
          name: winner.name,
          rank: winner.rank,
          avatar: winner.avatar,
          wins: winner.pressluckhighscores.length
        };
      });

      results = results.sort((a, b) => b.wins - a.wins);
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  gameStats,
  categoryStats,
  joustGameStats,
  siegeGameStats,
  pressLuckGameStats,
  pressLuckLastWeekWinners,
  pressLuckAllTimeWinners
};
