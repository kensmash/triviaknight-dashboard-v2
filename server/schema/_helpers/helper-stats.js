const mongoose = require("mongoose");
const User = require("../../models/User");
const Question = require("../../models/Question");
const GameJoust = require("../../models/GameJoust");
const GameSiege = require("../../models/GameSiege");
const GameQuest = require("../../models/GameQuest");
const { currentQuestTopic } = require("../_helpers/helper-gamesquest");
const util = require("util");

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
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames",
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
            $concatArrays: [
              "$soloGames",
              "$joustGames",
              "$siegeGames",
              "$questGames",
            ],
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

//game stats NOT broken down by type
const questionStats = async (userId) => {
  try {
    const simplegamestats = await User.aggregate([
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
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames",
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
            $concatArrays: [
              "$soloGames",
              "$joustGames",
              "$siegeGames",
              "$questGames",
            ],
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
          _id: "$totalGames._id",
          stats: "$totalGames.players",
        },
      },
      //only keep current player documents
      { $match: { "stats.player": new mongoose.Types.ObjectId(userId) } },
      //get a document for each round result
      { $unwind: "$stats.roundresults" },
      {
        $project: {
          _id: 1,
          stats: "$stats",
          results: "$stats.roundresults",
        },
      },
      //group by game
      {
        $group: {
          _id: 0,
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
          averagescore: "$averagescore",
          questionsanswered: "$questionsAnswered",
          correctanswers: "$correctAnswers",
          incorrectanswers: "$incorrectAnswers",
          normalquestions: "$normalquestions",
          normalcorrect: "$normalcorrect",
          hardquestions: "$hardquestions",
          hardcorrect: "$hardcorrect",
          percentcorrect: {
            $trunc: {
              $multiply: [
                { $divide: ["$correctAnswers", "$questionsAnswered"] },
                100,
              ],
            },
          },
        },
      },
    ]);
    if (!simplegamestats.length) {
      return {
        questionsanswered: 0,
        correctanswers: 0,
        incorrectanswers: 0,
        normalquestions: 0,
        normalcorrect: 0,
        hardquestions: 0,
        hardcorrect: 0,
        percentcorrect: 0,
      };
    } else {
      return simplegamestats[0];
    }
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
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames",
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
            $concatArrays: [
              "$soloGames",
              "$joustGames",
              "$siegeGames",
              "$questGames",
            ],
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
    if (!questions.length) {
      return 0;
    } else {
      return questions[0].questionsAnswered;
    }
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
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames",
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
            $concatArrays: [
              "$soloGames",
              "$joustGames",
              "$siegeGames",
              "$questGames",
            ],
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
          players: "$totalGames.players",
        },
      },
      //only keep current player documents
      { $match: { "players.player": new mongoose.Types.ObjectId(userId) } },
      //get a document per each round result
      { $unwind: "$players.roundresults" },
      //attempt to remove duplicate questions
      {
        $group: {
          _id: "$players.roundresults.category",
          results: { $push: "$players.roundresults" },
          uniqueQuestions: { $addToSet: "$players.roundresults.question" },
        },
      },
      { $unwind: "$uniqueQuestions" },
      //project to preserve the round result for each question via filter
      {
        $project: {
          uniqueQuestions: 1,
          roundresults: {
            $filter: {
              input: "$results",
              as: "roundresults",
              cond: {
                $eq: ["$$roundresults.question", "$$CURRENT.uniqueQuestions"],
              },
            },
          },
        },
      },
      //group by category
      {
        $group: {
          _id: "$_id",
          questionsanswered: { $sum: 1 },
          correct: {
            $sum: {
              $cond: [{ $arrayElemAt: ["$roundresults.correct", 0] }, 1, 0],
            },
          },
          incorrect: {
            $sum: {
              $cond: [{ $arrayElemAt: ["$roundresults.correct", 0] }, 0, 1],
            },
          },
        },
      },
      //get category info from reference
      {
        $lookup: {
          from: "categories",
          localField: "_id",
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
        },
      },
      { $sort: { questionsanswered: -1, percentcorrect: -1 } },
    ]);
    /*console.log(
      util.inspect(categorystats, { showHidden: false, depth: null })
    );*/
    //console.log(categorystats);
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
      //filter out party users
      {
        $match: {
          roles: { $nin: ["reviewer"] },
          access: { $eq: "paid" },
          "preferences.showonleaderboards": { $eq: true },
        },
      },
      //find all games per user
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
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames",
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
          rank: 1,
          avatar: 1,
          avatarBackgroundColor: 1,
          totalGames: {
            $concatArrays: [
              "$soloGames",
              "$joustGames",
              "$siegeGames",
              "$questGames",
            ],
          },
        },
      },
      //get a document for each game
      { $unwind: "$totalGames" },
      //filter the players array to only keep current player
      {
        $project: {
          _id: 1,
          name: 1,
          rank: 1,
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
      //get a document for the current player in each game
      { $unwind: "$players" },
      //get a document per each round result
      { $unwind: "$players.roundresults" },
      //only keep round results in current category
      {
        $match: {
          "players.roundresults.category": new mongoose.Types.ObjectId(catId),
        },
      },
      //attempt to remove duplicate questions
      {
        $group: {
          _id: {
            player: "$players.player",
          },
          id: { $first: "$_id" },
          name: { $first: "$name" },
          rank: { $first: "$rank" },
          avatar: { $first: "$avatar" },
          avatarBackgroundColor: { $first: "$avatarBackgroundColor" },
          uniqueQuestions: { $addToSet: "$players.roundresults.question" },
          roundresults: { $push: "$players.roundresults" },
        },
      },
      //at this point we have a document for each player, with an array of unique questions
      //that the player has answered for the given category
      //unwind to get a doc for each question
      { $unwind: "$uniqueQuestions" },
      //project to preserve the round result for each question via filter
      {
        $project: {
          id: 1,
          name: 1,
          rank: 1,
          avatar: 1,
          avatarBackgroundColor: 1,
          uniqueQuestions: 1,
          roundresults: {
            $filter: {
              input: "$roundresults",
              as: "roundresults",
              cond: {
                $eq: ["$$roundresults.question", "$$CURRENT.uniqueQuestions"],
              },
            },
          },
        },
      },
      //group by player again
      {
        $group: {
          _id: "$id",
          id: { $first: "$id" },
          name: { $first: "$name" },
          rank: { $first: "$rank" },
          avatar: { $first: "$avatar" },
          avatarBackgroundColor: { $first: "$avatarBackgroundColor" },
          questionsanswered: { $sum: 1 },
          correct: {
            $sum: {
              $cond: [{ $arrayElemAt: ["$roundresults.correct", 0] }, 1, 0],
            },
          },
        },
      },
      //shape the cat data
      {
        $project: {
          _id: 0,
          id: "$id",
          name: "$name",
          rank: "$rank",
          avatar: "$avatar",
          avatarBackgroundColor: "$avatarBackgroundColor",
          questionsanswered: "$questionsanswered",
          correct: 1,
          percentcorrect: {
            $trunc: {
              $multiply: [{ $divide: ["$correct", "$questionsanswered"] }, 100],
            },
          },
        },
      },
      { $sort: { questionsanswered: -1, percentcorrect: -1 } },
    ]);
    /*console.log(
      util.inspect(categoryrankings, { showHidden: false, depth: null })
    );*/
    return categoryrankings;
  } catch (error) {
    console.error(error);
  }
};

//track category stats per user
const userSingleCategoryStat = async (userId, catId) => {
  //tracks amount of questions in category
  try {
    const catquestions = await Question.aggregate([
      {
        $match: {
          category: { $eq: mongoose.Types.ObjectId(catId) },
          published: { $eq: true },
        },
      },
      {
        $count: "questions",
      },
    ]);

    let usersinglecatstat = await User.aggregate([
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
          from: "gamessiege",
          localField: "_id",
          foreignField: "players.player",
          as: "siegeGames",
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
            $concatArrays: [
              "$soloGames",
              "$joustGames",
              "$siegeGames",
              "$questGames",
            ],
          },
        },
      },
      //get a document for each game
      { $unwind: "$totalGames" },
      //filter the players array to only keep current player
      {
        $project: {
          players: {
            $filter: {
              input: "$totalGames.players",
              as: "player",
              cond: {
                $eq: ["$$player.player", new mongoose.Types.ObjectId(userId)],
              },
            },
          },
        },
      },
      //get a document for the current player in each game
      { $unwind: "$players" },
      //get a document per each round result
      { $unwind: "$players.roundresults" },
      //only keep round results in current category
      {
        $match: {
          "players.roundresults.category": new mongoose.Types.ObjectId(catId),
        },
      },
      //attempt to remove duplicate questions
      {
        $group: {
          _id: {
            player: "$players.player",
          },
          players: { $first: "$players" },
          results: { $push: "$players.roundresults" },
          uniqueQuestions: { $addToSet: "$players.roundresults.question" },
        },
      },
      { $unwind: "$uniqueQuestions" },
      //project to preserve the round result for each question via filter
      {
        $project: {
          uniqueQuestions: 1,
          roundresults: {
            $filter: {
              input: "$results",
              as: "roundresults",
              cond: {
                $eq: ["$$roundresults.question", "$$CURRENT.uniqueQuestions"],
              },
            },
          },
        },
      },
      //group and calculate stats
      {
        $group: {
          _id: 0,
          questionsanswered: { $sum: 1 },
          correct: {
            $sum: {
              $cond: [{ $arrayElemAt: ["$roundresults.correct", 0] }, 1, 0],
            },
          },
          incorrect: {
            $sum: {
              $cond: [{ $arrayElemAt: ["$roundresults.correct", 0] }, 0, 1],
            },
          },
          normalquestions: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    { $arrayElemAt: ["$roundresults.difficulty", 0] },
                    "Normal",
                  ],
                },
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
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.difficulty", 0] },
                        "Normal",
                      ],
                    },
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.correct", 0] },
                        true,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          normalincorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.difficulty", 0] },
                        "Normal",
                      ],
                    },
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.correct", 0] },
                        false,
                      ],
                    },
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
                {
                  $eq: [
                    { $arrayElemAt: ["$roundresults.difficulty", 0] },
                    "Hard",
                  ],
                },
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
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.difficulty", 0] },
                        "Hard",
                      ],
                    },
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.correct", 0] },
                        true,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          hardincorrect: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.difficulty", 0] },
                        "Hard",
                      ],
                    },
                    {
                      $eq: [
                        { $arrayElemAt: ["$roundresults.correct", 0] },
                        false,
                      ],
                    },
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
          questionsanswered: "$questionsanswered",
          correct: 1,
          incorrect: 1,
          normalquestions: 1,
          normalcorrect: 1,
          normalincorrect: 1,
          hardquestions: 1,
          hardcorrect: 1,
          hardincorrect: 1,
          //stack overflow rocks https://stackoverflow.com/questions/22841266/how-to-handle-division-by-zero-in-mongodb-aggregation-framework
          normalpercentcorrect: {
            $cond: [
              { $eq: ["$normalquestions", 0] },
              0,
              {
                $trunc: {
                  $multiply: [
                    { $divide: ["$normalcorrect", "$normalquestions"] },
                    100,
                  ],
                },
              },
            ],
          },
          hardpercentcorrect: {
            $cond: [
              { $eq: ["$hardquestions", 0] },
              0,
              {
                $trunc: {
                  $multiply: [
                    { $divide: ["$hardcorrect", "$hardquestions"] },
                    100,
                  ],
                },
              },
            ],
          },
        },
      },
    ]);
    if (usersinglecatstat.length) {
      usersinglecatstat[0].catquestions = catquestions[0].questions;
      usersinglecatstat[0].questionsansweredpercent = Math.round(
        (usersinglecatstat[0].questionsanswered * 100) /
          catquestions[0].questions
      );
    } else {
      usersinglecatstat = [
        {
          catquestions: catquestions[0].questions,
          questionsanswered: 0,
          questionsansweredpercent: 0,
          correct: 0,
          incorrect: 0,
          normalquestions: 0,
          normalcorrect: 0,
          normalincorrect: 0,
          normalpercentcorrect: 0,
          hardquestions: 0,
          hardcorrect: 0,
          hardincorrect: 0,
          hardpercentcorrect: 0,
        },
      ];
    }

    /*console.log(
      util.inspect(usersinglecatstat, { showHidden: false, depth: null })
    );*/
    return usersinglecatstat[0];
  } catch (error) {
    console.error(error);
  }
};

//track player win loss record overall in jousts
const joustRecordStats = async (userId) => {
  try {
    const joustrecordstats = await GameJoust.aggregate([
      //find all games the user is in
      {
        $match: {
          "players.player": new mongoose.Types.ObjectId(userId),
          gameover: true,
          timedout: false,
          declined: false,
        },
      },
      //get a document for each game player
      { $unwind: "$players" },
      //only keep user documents
      {
        $match: {
          "players.player": { $in: [new mongoose.Types.ObjectId(userId)] },
        },
      },
      //group documents
      {
        $group: {
          _id: {
            player: "$players.player",
          },
          totalGames: { $sum: 1 },
          //we are checking opponent docs, so a win for them is a loss for us
          wins: {
            $sum: { $cond: [{ $eq: ["$players.winner", true] }, 1, 0] },
          },
          losses: {
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
      //the final data
      {
        $project: {
          _id: 0,
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
          winpercent: {
            $trunc: {
              $multiply: [{ $divide: ["$wins", "$totalGames"] }, 100],
            },
          },
          tiespercent: {
            $trunc: {
              $multiply: [{ $divide: ["$ties", "$totalGames"] }, 100],
            },
          },
        },
      },
    ]);
    if (!joustrecordstats.length) {
      return {
        gamesplayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winpercent: 0,
        tiespercent: 0,
      };
    } else {
      return joustrecordstats[0];
    }
  } catch (error) {
    console.error(error);
  }
};

//track player win loss record overall in sieges
const siegeRecordStats = async (userId) => {
  try {
    const siegerecordstats = await GameSiege.aggregate([
      //find all games the user is in
      {
        $match: {
          "players.player": new mongoose.Types.ObjectId(userId),
          gameover: true,
          timedout: false,
          declined: false,
        },
      },
      //get a document for each game player
      { $unwind: "$players" },
      //only keep user documents
      {
        $match: {
          "players.player": { $in: [new mongoose.Types.ObjectId(userId)] },
        },
      },
      //group documents
      {
        $group: {
          _id: {
            player: "$players.player",
          },
          totalGames: { $sum: 1 },
          //we are checking opponent docs, so a win for them is a loss for us
          wins: {
            $sum: { $cond: [{ $eq: ["$players.winner", true] }, 1, 0] },
          },
          losses: {
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
      //the final data
      {
        $project: {
          _id: 0,
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
          winpercent: {
            $trunc: {
              $multiply: [{ $divide: ["$wins", "$totalGames"] }, 100],
            },
          },
          tiespercent: {
            $trunc: {
              $multiply: [{ $divide: ["$ties", "$totalGames"] }, 100],
            },
          },
        },
      },
    ]);
    if (!siegerecordstats.length) {
      return {
        gamesplayed: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winpercent: 0,
        tiespercent: 0,
      };
    } else {
      return siegerecordstats[0];
    }
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
          opponentrank: { $arrayElemAt: ["$opponent.rank", 0] },
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
      { $sort: { gamesplayed: -1, wins: -1 } },
    ]);
    return jouststats;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of siege games, wins, losses and ties per opponent
const siegeGameStats = async (userId) => {
  try {
    const siegestats = await GameSiege.aggregate([
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
          opponentrank: { $arrayElemAt: ["$opponent.rank", 0] },
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
      { $sort: { gamesplayed: -1, wins: -1 } },
    ]);
    return siegestats;
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
          preferences: {
            $arrayElemAt: ["$player.preferences", 0],
          },
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
      {
        $match: { "preferences.showonleaderboards": { $eq: true } },
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
      const notShyWinners = winners.filter(
        (winner) => winner.preferences.showonleaderboards
      );
      if (notShyWinners.length) {
        results = notShyWinners.map((winner) => {
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
      "preferences.showonleaderboards": true,
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
  questionStats,
  categoryStats,
  joustGameStats,
  siegeGameStats,
  joustRecordStats,
  siegeRecordStats,
  questGameStats,
  questLastWeekWinners,
  questAllTimeWinners,
  questionsAnswered,
  categoryRankings,
  userSingleCategoryStat,
};
