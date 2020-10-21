const GameSiege = require("../../models/GameSiege");
const User = require("../../models/User");
const ExpoPushTicket = require("../../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");

const changeSiegeTurn = async (gameid, player, opponent, expo) => {
  try {
    await GameSiege.findOneAndUpdate(
      { _id: gameid, "players.player": opponent.player._id },
      {
        $set: {
          "players.$.turn": true,
        },
      }
    );
    const updatedGame = await GameSiege.findOneAndUpdate(
      { _id: gameid, "players.player": player.player._id },
      {
        $set: {
          "players.$.turn": false,
        },
      },
      { new: true }
    )
      .populate("players.player")
      .populate("players.questions")
      .populate("players.replacedquestions");

    const opponentInfo = await User.findOne({
      _id: opponent.player._id,
      "preferences.acceptsgamepushnotifications": true,
    });

    if (opponentInfo) {
      const pushTokens = opponentInfo.expoPushTokens;

      //push notifications
      let messages = [];
      let pushType = "SiegeChallenge";
      let pushTitle = `Siege Game vs. ${player.player.name}`;
      let pushMessage = `${player.player.name} has challenged you to a Siege!`;

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
            title: pushTitle,
            text: pushMessage,
            type: pushType,
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
            type: "Siege Challenge",
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

    return updatedGame;
  } catch (error) {
    console.error(error);
  }
};

const endSiegeGame = async (gameid, player, opponent, expo) => {
  //enter player results
  try {
    const playerScore = player.roundresults
      .map((results) => results.points)
      .reduce((a, b) => a + b, 0);

    const opponentScore = opponent.roundresults
      .map((results) => results.points)
      .reduce((a, b) => a + b, 0);

    let winningplayer = "";
    let losingplayer = "";
    if (playerScore !== opponentScore) {
      if (playerScore > opponentScore) {
        winningplayer = player.player._id;
        losingplayer = opponent.player._id;
      } else {
        winningplayer = opponent.player._id;
        losingplayer = player.player._id;
      }
    }

    if (winningplayer === "") {
      try {
        await GameSiege.findOneAndUpdate(
          { _id: gameid },
          {
            $set: { "players.$[].tied": true },
          }
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await User.findOneAndUpdate(
          { _id: winningplayer },
          { $inc: { gems: 5, streak: 1 } }
        );
        await User.findOneAndUpdate(
          { _id: losingplayer },
          { $set: { streak: 0 } }
        );
        await GameSiege.findOneAndUpdate(
          { _id: gameid, "players.player": winningplayer },
          {
            $set: { "players.$.winner": true },
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
    //then end game
    const endedGame = await GameSiege.findOneAndUpdate(
      { _id: gameid, "players.player": player.player._id },
      {
        $set: { gameover: true, "players.$.resultsseen": true },
      },
      { new: true }
    )
      .populate("players.player")
      .populate("players.questions")
      .populate("players.replacedquestions");

    //push notifications
    let messages = [];
    let pushType = "SiegeEnded";
    let pushTitle = `Siege Game Ended`;
    let pushMessage = `${player.player.name} has completed a Siege Game. See the results.`;

    const opponentInfo = await User.findOne({
      _id: opponent.player._id,
      "preferences.acceptsgamepushnotifications": true,
    });

    if (opponentInfo) {
      const pushTokens = opponentInfo.expoPushTokens;

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
            title: pushTitle,
            text: pushMessage,
            type: pushType,
            gameid: endedGame._id,
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
            type: "Siege Ended",
            ...ticket,
          }));
          //save tickets to database for later retrieval
          for (let ticket of ticketsWithTypes) {
            try {
              const newticket = new ExpoPushTicket(ticket);
              newticket.save();
            } catch (error) {
              console.error(error);
            }
          }
        }
      })();
    }

    return endedGame;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  changeSiegeTurn,
  endSiegeGame,
};
