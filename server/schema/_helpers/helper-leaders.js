const GameJoust = require("../../models/GameJoust");

//tracks number of joust games, wins, losses and ties per opponent
const joustLeaderAllTimeStats = async () => {
  try {
    const jouststats = await GameJoust.aggregate([
      //find all completed joust
      {
        $match: {
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
    ]);
    //console.log("jouststats", jouststats);
    return jouststats;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  joustLeaderAllTimeStats,
};
