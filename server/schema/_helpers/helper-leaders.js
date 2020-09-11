const GameJoust = require("../../models/GameJoust");
const GameSiege = require("../../models/GameSiege");

//https://stackoverflow.com/questions/59174323/how-can-i-retrieve-current-weeks-data-on-mongoose
const getBeginningOfTheWeek = (now) => {
  const days = (now.getDay() + 7 - 1) % 7;
  now.setDate(now.getDate() - days);
  now.setHours(0, 0, 0, 0);
  return now;
};

//tracks number of joust games, wins, losses and ties per opponent
const joustLeaderThisWeekStats = async () => {
  try {
    const jouststats = await GameJoust.aggregate([
      //find all completed joust
      {
        $match: {
          gameover: true,
          declined: false,
          timedout: false,
          updatedAt: {
            $gte: getBeginningOfTheWeek(new Date()),
            $lt: new Date(),
          },
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
          //get win/loss record
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
      //get opponent info from reference
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
          joustsevendayid: { $arrayElemAt: ["$player._id", 0] },
          name: { $arrayElemAt: ["$player.name", 0] },
          preferences: {
            $arrayElemAt: ["$player.preferences", 0],
          },
          rank: { $arrayElemAt: ["$player.rank", 0] },
          avatar: { $arrayElemAt: ["$player.avatar", 0] },
          avatarBackgroundColor: {
            $arrayElemAt: ["$player.avatarBackgroundColor", 0],
          },
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
        },
      },
      {
        $match: { "preferences.showonleaderboards": true },
      },
      { $sort: { gamesplayed: -1, wins: -1 } },
    ]);
    //console.log("jouststats", jouststats);
    return jouststats;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of siege games, wins, losses and ties per opponent
const siegeLeaderThisWeekStats = async () => {
  try {
    const siegestats = await GameSiege.aggregate([
      //find all completed sieges
      {
        $match: {
          gameover: true,
          declined: false,
          timedout: false,
          updatedAt: {
            $gte: getBeginningOfTheWeek(new Date()),
            $lt: new Date(),
          },
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
          //get win/loss record
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
      //get opponent info from reference
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
          id: { $arrayElemAt: ["$player._id", 0] },
          name: { $arrayElemAt: ["$player.name", 0] },
          preferences: {
            $arrayElemAt: ["$player.preferences", 0],
          },
          rank: { $arrayElemAt: ["$player.rank", 0] },
          avatar: { $arrayElemAt: ["$player.avatar", 0] },
          avatarBackgroundColor: {
            $arrayElemAt: ["$player.avatarBackgroundColor", 0],
          },
          gamesplayed: "$totalGames",
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
        },
      },
      {
        $match: { "preferences.showonleaderboards": true },
      },
      { $sort: { gamesplayed: -1, wins: -1 } },
    ]);
    //console.log("jouststats", jouststats);
    return siegestats;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of joust games, wins, losses and ties per opponent
const joustLeaderAllTimeStats = async () => {
  try {
    const jouststats = await GameJoust.aggregate([
      //find all completed joust
      {
        $match: {
          gameover: true,
          declined: false,
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
          //get win/loss record
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
      //get opponent info from reference
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
          joustid: { $arrayElemAt: ["$player._id", 0] },
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
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
        },
      },
      {
        $match: { "preferences.showonleaderboards": true },
      },
      { $sort: { gamesplayed: -1, wins: -1 } },
      { $limit: 25 },
    ]);
    //console.log("jouststats", jouststats);
    return jouststats;
  } catch (error) {
    console.error(error);
  }
};

//tracks number of siege games, wins, losses and ties per opponent
const siegeLeaderAllTimeStats = async () => {
  try {
    const siegestats = await GameSiege.aggregate([
      //find all completed sieges
      {
        $match: {
          gameover: true,
          declined: false,
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
          //get win/loss record
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
      //get opponent info from reference
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
          wins: "$wins",
          losses: "$losses",
          ties: "$ties",
        },
      },
      {
        $match: { "preferences.showonleaderboards": true },
      },
      { $sort: { gamesplayed: -1, wins: -1 } },
      { $limit: 25 },
    ]);
    //console.log("jouststats", jouststats);
    return siegestats;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  joustLeaderThisWeekStats,
  siegeLeaderThisWeekStats,
  joustLeaderAllTimeStats,
  siegeLeaderAllTimeStats,
};
