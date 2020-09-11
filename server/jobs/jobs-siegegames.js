const schedule = require("node-schedule");
const GameSiege = require("../models/GameSiege");
const User = require("../models/User");
const ExpoPushTicket = require("../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");

//delete declined games after 2 days
const deleteDeclinedSiegeGames = schedule.scheduleJob(
  "0 0 * * *", // run everyday at midnight
  () => {
    console.log("siege game delete games function called");
    var deadline = new Date();
    deadline.setDate(deadline.getDate() - 2);
    GameSiege.deleteMany(
      {
        declined: { $eq: true },
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

//time out siege games three days after time out warning has been sent
const timeOutSiegeGames = schedule.scheduleJob("0 0 * * *", () => {
  console.log("siege game time out function called");
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  GameSiege.updateMany(
    {
      updatedAt: {
        $lte: threeDaysAgo,
      },
      gameover: false,
      timedout: false,
      timedoutwarningsent: true,
    }, // conditions
    {
      $set: { timedout: true, gameover: true },
    }
  );
});

//delete timed out games
const deleteTimedOutSiegeGames = schedule.scheduleJob(
  "0 0 * * *", // run everyday at midnight
  () => {
    console.log("siege game delete timed out function called");
    GameSiege.deleteMany(
      {
        timedout: true,
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  }
);

//find games that haven't been played in a week
const runningOutOfSiegeTime = schedule.scheduleJob(
  "0 12 * * *", // run everyday at noon
  //"*/5 * * * *", //every 5 minutes
  async () => {
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const games = await GameSiege.find({
      updatedAt: {
        $lte: sevenDaysAgo,
      },
      gameover: false,
      timedoutwarningsent: false,
    }).populate("players.player");

    //update the games so we don't send push notifications every day
    await GameSiege.updateMany(
      {
        gameover: false,
        timedoutwarningsent: false,
        updatedAt: {
          $lte: sevenDaysAgo,
        },
      }, // conditions
      {
        $set: { timedoutwarningsent: true },
      }
    );

    //send appropriate push notification reminder
    if (games.length) {
      //get players whose turn it is
      const playerids = games.map((game) => {
        const players = game.players;
        const turn = players.filter((player) => player.turn);
        return turn[0].player._id;
      });
      //find users in database
      const users = await User.find({
        _id: { $in: playerids },
        "preferences.acceptsgamepushnotifications": true,
      });
      //get their expoPushTokens
      if (users.length) {
        let pushTokens = [];
        users.forEach(
          (user) => (pushTokens = pushTokens.concat(user.expoPushTokens))
        );
        console.log("did we get timing out player tokens", pushTokens);
        //send them a push notification
        const expo = new Expo();
        let messages = [];
        const pushMessage = `It’s your turn! You have 3 days to finish your turn in your Siege game.`;
        for (let pushToken of pushTokens) {
          // Check that all your push tokens appear to be valid Expo push tokens
          if (!Expo.isExpoPushToken(pushToken)) {
            console.error(
              `Push token ${pushToken} is not a valid Expo push token.`
            );
            continue;
          }
          messages.push({
            to: pushToken,
            sound: "default",
            body: pushMessage,
            data: {
              title: "It’s your turn in a Siege!",
              text: pushMessage,
              type: "Siege Time Running Out",
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
              type: "Siege Time Running Out",
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
      }
    }
  }
);

module.exports = {
  deleteDeclinedSiegeGames,
  timeOutSiegeGames,
  deleteTimedOutSiegeGames,
  runningOutOfSiegeTime,
};
