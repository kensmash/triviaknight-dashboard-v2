const mongoose = require("mongoose");
const User = require("../../models/User");
const GameJoust = require("../../models/GameJoust");
const GameQuest = require("../../models/GameQuest");
const { currentQuestTopic } = require("../_helpers/helper-gamesquest");

//tracks questions answered, correct and incorrect per game type
const gameStats = async (userId) => {
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
          as: "soloGames",
        },
      },
      {
        $lookup: {
          from: "gamesjoust",
          localField: "_id",
          foreignField: "players.player",
          as: "joustGames",
        },
      },
      {
        $lookup: {
          from: "gamesquest",
          localField: "_id",
          foreignField: "players.player",
          as: "questGames",
        },
      },
      //combine games
      {
        $project: {
          totalGames: {
            $concatArrays: ["$soloGames", "$joustGames", "$questGames"],
          },
        },
      },
      //get a document for each game
      { $unwind: "$totalGames" },
      //get a document for each player
      { $unwind: "$totalGames.players" },
      //retain game type and player info
      {
        $project: {
          type: "$totalGames.type",
          stats: "$totalGames.players",
        },
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
          results: "$stats.roundresults",
        },
      },
      //group by game type
      {
        $group: {
          _id: { type: "$type" },
          questionsAnswered: { $sum: 1 },
          averagescore: { $avg: "$stats.score" },
          correctAnswers: {
            $sum: {
              $cond: ["$results.correct", 1, 0],
            },
          },
          incorrectAnswers: {
            $sum: {
              $cond: ["$results.correct", 0, 1],
            },
          },
          normalquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Normal"] }, 1, 0],
            },
          },
          normalcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Normal"] },
                    { $eq: ["$results.correct", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          hardquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Hard"] }, 1, 0],
            },
          },
          hardcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Hard"] },
                    { $eq: ["$results.correct", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
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
          hardcorrect: "$hardcorrect",
        },
      },
    ]);
    return gamestats;
  } catch (error) {
    console.error(error);
  }
};

//figure out how many questions a player has answered
const questionsAnswered = async (userId) => {
  try {
    const questions = await User.aggregate([
      //match user
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      //find all games user is in
      {
        $lookup: {
          from: "gamessolo",
          localField: "_id",
          foreignField: "players.player",
          as: "soloGames",
        },
      },
      {
        $lookup: {
          from: "gamesjoust",
          localField: "_id",
          foreignField: "players.player",
          as: "joustGames",
        },
      },
      {
        $lookup: {
          from: "gamesquest",
          localField: "_id",
          foreignField: "players.player",
          as: "questGames",
        },
      },
      //combine games
      {
        $project: {
          totalGames: {
            $concatArrays: ["$soloGames", "$joustGames", "$questGames"],
          },
        },
      },
      //get a document for each game
      { $unwind: "$totalGames" },
      //get a document for each player
      { $unwind: "$totalGames.players" },
      //retain player info
      {
        $project: {
          stats: "$totalGames.players",
        },
      },
      //only keep current player documents
      { $match: { "stats.player": new mongoose.Types.ObjectId(userId) } },
      //get a document for each round result
      { $unwind: "$stats.roundresults" },
      //the final data
      {
        $group: {
          _id: 0,
          questionsAnswered: { $sum: 1 },
        },
      },
    ]);
    return questions[0].questionsAnswered;
  } catch (error) {
    console.error(error);
  }
};

//tracks questions answered, correct and incorrect per category
const categoryStats = async (userId) => {
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
          as: "soloGames",
        },
      },
      {
        $lookup: {
          from: "gamesjoust",
          localField: "_id",
          foreignField: "players.player",
          as: "joustGames",
        },
      },
      {
        $lookup: {
          from: "gamesquest",
          localField: "_id",
          foreignField: "players.player",
          as: "questGames",
        },
      },
      //combine games
      {
        $project: {
          totalGames: {
            $concatArrays: ["$soloGames", "$joustGames", "$questGames"],
          },
        },
      },

      //get a document for each game
      { $unwind: "$totalGames" },
      //get a document for each player in each game
      { $unwind: "$totalGames.players" },
      //only keep player stats and round results from each document
      {
        $project: {
          id: 1,
          name: 1,
          avatar: 1,
          avatarBackgroundColor: 1,
          stats: "$totalGames.players",
          results: "$totalGames.players.roundresults",
        },
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
              $cond: ["$results.correct", 1, 0],
            },
          },
          incorrect: {
            $sum: {
              $cond: ["$results.correct", 0, 1],
            },
          },
          normalquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Normal"] }, 1, 0],
            },
          },
          normalcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Normal"] },
                    { $eq: ["$results.correct", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          hardquestions: {
            $sum: {
              $cond: [{ $eq: ["$results.difficulty", "Hard"] }, 1, 0],
            },
          },
          hardcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$results.difficulty", "Hard"] },
                    { $eq: ["$results.correct", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      //get category info from reference
      {
        $lookup: {
          from: "categories",
          localField: "_id.category",
          foreignField: "_id",
          as: "category",
        },
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
          hardcorrect: "$hardcorrect",
        },
      },
      //only keep published and non-party cats
      {
        $match: {
          categorypublished: { $eq: true },
          partycategory: { $eq: false },
        },
      },
      //get cat type icon
      {
        $lookup: {
          from: "categorytypes",
          localField: "categorytype",
          foreignField: "_id",
          as: "categorytype",
        },
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
              $multiply: [{ $divide: ["$correct", "$questionsanswered"] }, 100],
            },
          },
          normalquestions: "$normalquestions",
          normalcorrect: "$normalcorrect",
          hardquestions: "$hardquestions",
          hardcorrect: "$hardcorrect",
        },
      },
    ]);
    return categorystats;
  } catch (error) {
    console.error(error);
  }
};

//track category stats per user
const categoryRankings = async (catId) => {
  //tracks
  try {
    const categoryrankings = await User.aggregate([
      //match user
      { $match: { roles: { $nin: ["reviewer"] }, access: { $eq: "paid" } } },
      //find all games the user is in
      {
        $lookup: {
          from: "gamessolo",
          localField: "_id",
          foreignField: "players.player",
          as: "soloGames",
        },
      },
      {
        $lookup: {
          from: "gamesjoust",
          localField: "_id",
          foreignField: "players.player",
          as: "joustGames",
        },
      },
      {
        $lookup: {
          from: "gamesquest",
          localField: "_id",
          foreignField: "players.player",
          as: "questGames",
        },
      },
      //combine games
      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          avatarBackgroundColor: 1,
          totalGames: {
            $concatArrays: ["$soloGames", "$joustGames", "$questGames"],
          },
        },
      },
      //get a document for each game
      { $unwind: "$totalGames" },
      //only keep current player stats and round results from each document
      {
        $project: {
          _id: 1,
          name: 1,
          avatar: 1,
          avatarBackgroundColor: 1,
          players: {
            $filter: {
              input: "$totalGames.players",
              as: "player",
              cond: { $eq: ["$$player.player", "$$CURRENT._id"] },
            },
          },
        },
      },
      //get a document for the player in each game
      { $unwind: "$players" },
      //get a document per each round result
      { $unwind: "$players.roundresults" },
      {
        $match: {
          "players.roundresults.category": new mongoose.Types.ObjectId(catId),
        },
      },
      //group by player
      {
        $group: {
          _id: {
            player: "$players.player",
          },
          id: { $first: "$_id" },
          name: { $first: "$name" },
          avatar: { $first: "$avatar" },
          avatarBackgroundColor: { $first: "$avatarBackgroundColor" },
          questionsanswered: { $sum: 1 },
          correct: {
            $sum: {
              $cond: ["$players.roundresults.correct", 1, 0],
            },
          },
          incorrect: {
            $sum: {
              $cond: ["$players.roundresults.correct", 0, 1],
            },
          },

          normalquestions: {
            $sum: {
              $cond: [
                { $eq: ["$players.roundresults.difficulty", "Normal"] },
                1,
                0,
              ],
            },
          },
          normalcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$players.roundresults.difficulty", "Normal"] },
                    { $eq: ["$players.roundresults.correct", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          hardquestions: {
            $sum: {
              $cond: [
                { $eq: ["$players.roundresults.difficulty", "Hard"] },
                1,
                0,
              ],
            },
          },
          hardcorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$players.roundresults.difficulty", "Hard"] },
                    { $eq: ["$players.roundresults.correct", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      //shape the cat data
      {
        $project: {
          _id: 0,
          playerid: "$id",
          playername: "$name",
          playeravatar: "$avatar",
          playerAvatarBackgroundColor: "$avatarBackgroundColor",
          questionsanswered: "$questionsanswered",
          correct: 1,
          incorrect: 1,
          percentcorrect: {
            $trunc: {
              $multiply: [{ $divide: ["$correct", "$questionsanswered"] }, 100],
            },
          },
          normalquestions: "$normalquestions",
          normalcorrect: "$normalcorrect",
          hardquestions: "$hardquestions",
          hardcorrect: "$hardcorrect",
        },
      },
      { $sort: { questionsanswered: -1, correct: -1 } },
    ]);
    //console.log(categoryrankings);
    return categoryrankings;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of joust games, wins, losses and ties per opponent
const joustGameStats = async (userId) => {
  try {
    const jouststats = await GameJoust.aggregate([
      //find all games the user is in
      {
        $match: {
          "players.player": new mongoose.Types.ObjectId(userId),
          gameover: true,
          timedout: false,
        },
      },
      //get a document for each game player
      { $unwind: "$players" },
      //only use opponent documents
      {
        $match: {
          "players.player": { $nin: [new mongoose.Types.ObjectId(userId)] },
        },
      },
      //group documents by opponent
      {
        $group: {
          _id: {
            opponent: "$players.player",
          },
          totalGames: { $sum: 1 },
          //we are checking opponent docs, so a win for them is a loss for us
          losses: {
            $sum: { $cond: [{ $eq: ["$players.winner", true] }, 1, 0] },
          },
          wins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$players.winner", false] },
                    { $eq: ["$players.tied", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          ties: { $sum: { $cond: [{ $eq: ["$players.tied", true] }, 1, 0] } },
        },
      },
      //get opponent info from reference
      {
        $lookup: {
          from: "users",
          localField: "_id.opponent",
          foreignField: "_id",
          as: "opponent",
        },
      },
      //the final data
      {
        $project: {
          _id: 0,
          opponentid: { $arrayElemAt: ["$opponent._id", 0] },
          opponentname: { $arrayElemAt: ["$opponent.name", 0] },
          opponentavatar: { $arrayElemAt: ["$opponent.avatar", 0] },
          opponentAvatarBackgroundColor: {
            $arrayElemAt: ["$opponent.avatarBackgroundColor", 0],
          },
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
        },
      },
    ]);
    return jouststats;
  } catch (error) {
    console.error(error);
  }
};

//tracks quest games
const questGameStats = async () => {
  const currentTopic = await currentQuestTopic();
  try {
    const queststats = await GameQuest.aggregate([
      //find all games of genre within past week
      {
        $match: {
          createdAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
          topic: { $eq: currentTopic.topic },
          gameover: true,
          timedout: false,
        },
      },
      //get a document for each game player
      { $unwind: "$players" },
      //group documents by player
      {
        $group: {
          _id: {
            player: "$players.player",
          },
          totalGames: { $sum: 1 },
          highScore: { $max: "$players.score" },
        },
      },

      //get player info from reference
      {
        $lookup: {
          from: "users",
          localField: "_id.player",
          foreignField: "_id",
          as: "player",
        },
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
          avatarBackgroundColor: {
            $arrayElemAt: ["$player.avatarBackgroundColor", 0],
          },
          gamesplayed: "$totalGames",
          highscore: "$highScore",
        },
      },
      { $sort: { highscore: -1 } },
    ]);
    return queststats;
  } catch (error) {
    console.error(error);
  }
};

//quest last week winner
const questLastWeekWinners = async () => {
  try {
    let lastWeeksTopic = "";
    let results = [];

    //date stuff
    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 16);

    //find last week's topic
    const allPreviousWinners = await User.find({
      questhighscores: { $exists: true, $ne: [] },
    }).sort({ "questhighscores.date": -1 });

    if (allPreviousWinners.length) {
      lastWeeksTopic =
        allPreviousWinners[0].questhighscores[
          allPreviousWinners[0].questhighscores.length - 1
        ].topic;
    }
    //only get last week's topic winners from previous week
    const winners = await User.find({
      "questhighscores.topic": { $eq: lastWeeksTopic },
      "questhighscores.date": { $gte: lastWeek },
    }).sort({ "questhighscores.date": -1 });

    //return results
    if (winners.length) {
      results = winners.map((winner) => {
        const lasthighscore =
          winner.questhighscores[winner.questhighscores.length - 1];
        return {
          topic: lasthighscore.topic,
          id: winner._id,
          name: winner.name,
          rank: winner.rank,
          avatar: winner.avatar,
          avatarBackgroundColor: winner.avatarBackgroundColor,
          highscore: lasthighscore.score,
        };
      });
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

//quest all time winners
const questAllTimeWinners = async () => {
  try {
    let results = [];
    const winners = await User.find({
      "questhighscores.date": { $exists: true },
    });
    if (winners.length) {
      results = winners.map((winner) => {
        return {
          id: winner._id,
          name: winner.name,
          rank: winner.rank,
          avatar: winner.avatar,
          avatarBackgroundColor: winner.avatarBackgroundColor,
          wins: winner.questhighscores.length,
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
  questGameStats,
  questLastWeekWinners,
  questAllTimeWinners,
  questionsAnswered,
  categoryRankings,
};
