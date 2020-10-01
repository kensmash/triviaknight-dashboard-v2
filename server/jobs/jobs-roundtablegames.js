const schedule = require("node-schedule");
const GameRoundTable = require("../models/GameRoundTable");

//delete cancelled round table after 2 days
const deleteCancelledRoundTableGames = schedule.scheduleJob(
  "0 0 * * *", // run everyday at midnight
  () => {
    console.log("roundtable delete cancelled games function called");
    var deadline = new Date();
    deadline.setDate(deadline.getDate() - 2);
    GameRoundTable.deleteMany(
      {
        cancelled: { $eq: true },
        updatedAt: {
          $lte: deadline,
        },
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  }
);

//expire roundtable games that are haven't been played in 10 days
const expireRoundTableGames = schedule.scheduleJob("0 0 * * *", () => {
  console.log("roundtable game expire function called");
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  GameRoundTable.updateMany(
    {
      updatedAt: {
        $lte: threeDaysAgo,
      },
      gameover: false,
      expired: false,
    }, // conditions
    {
      $set: { expired: true, gameover: true },
    }
  );
});

//delete expired roundtable games
const deleteExpiredRoundTableGames = schedule.scheduleJob(
  "0 0 * * *", // run everyday at midnight
  () => {
    console.log("roundtable delete expired games function called");
    GameRoundTable.deleteMany(
      {
        expired: { $eq: true },
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  }
);

module.exports = {
  deleteCancelledRoundTableGames,
  expireRoundTableGames,
  deleteExpiredRoundTableGames,
};
