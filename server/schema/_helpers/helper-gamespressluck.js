const mongoose = require("mongoose");
const User = require("../../models/User");
const GamePressYourLuck = require("../../models/GamePressYourLuck");
const CategoryType = require("../../models/CategoryType");
const CategoryGenre = require("../../models/CategoryGenre");
const Category = require("../../models/Category");
const ExpoPushTicket = require("../../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");

const currentPressLuckTopic = async () => {
  try {
    let results = {};
    //look in categories
    const catTopic = await Category.findOne({
      pressluckactive: { $eq: true }
    });
    if (catTopic) {
      results = {
        id: catTopic._id,
        type: "Category",
        topic: catTopic.name
      };
    }
    //also in category types
    const catTypeTopic = await CategoryType.findOne({
      pressluckactive: { $eq: true }
    });
    if (catTypeTopic) {
      results = {
        id: catTypeTopic._id,
        type: "Category Type",
        topic: catTypeTopic.name
      };
    }
    //and in genres
    const catGenreTopic = await CategoryGenre.findOne({
      pressluckactive: { $eq: true }
    });
    if (catGenreTopic) {
      results = {
        id: catGenreTopic._id,
        type: "Genre",
        topic: catGenreTopic.name
      };
    }

    return results;
  } catch (error) {
    console.error(error);
  }
};

const savePressLuckHighScore = async (topic, expo) => {
  //first, get all games from previous week with current topic
  try {
    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 8);
    const lastWeeksGames = await GamePressYourLuck.find({
      topic,
      updatedAt: {
        $gte: lastWeek
      }
    }).populate("players.player");

    if (lastWeeksGames.length) {
      //loop through games and get high score
      const gamePlayers = lastWeeksGames.map(game => game.players[0]);
      const winningScores = gamePlayers.map(player => player.score);
      //check which score was highest
      const highScore = Math.max(...winningScores);
      //only set a winner if there was a player with a score greater than 0
      if (highScore > 0) {
        //check if more than one player score matches winning score
        let winningPlayers = gamePlayers.filter(
          player => player.score === highScore
        );

        //if more than one player has highest score, set multiple players as winners
        if (winningPlayers.length > 1) {
          await User.updateMany(
            {
              _id: {
                $in: winningPlayers.map(player =>
                  mongoose.Types.ObjectId(player.player._id)
                )
              }
            },
            {
              $addToSet: {
                pressluckhighscores: {
                  topic,
                  score: winningPlayers[0].score,
                  date: Date.Now
                }
              }
            }
          );
        } else if (winningPlayers.length === 1) {
          //only one player has highest score, that player is the winner
          await User.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(winningPlayers[0].player._id) },
            {
              $addToSet: {
                pressluckhighscores: {
                  topic,
                  score: winningPlayers[0].score,
                  date: Date.Now
                }
              }
            }
          );
        }
        //Send push notification to winners
        let pushTokens = [];

        const winningUsers = await User.find({
          _id: {
            $in: winningPlayers.map(player =>
              mongoose.Types.ObjectId(player.player._id)
            )
          }
        });

        winningUsers.forEach(
          user => (pushTokens = pushTokens.concat(user.expoPushTokens))
        );

        //push notifications
        let messages = [];
        let pushType = "PressLuckWinner";
        let pushTitle = `You won!`;
        let pushMessage = `Congratulations! You won this past week’s ${topic} Press Your Luck with your score of ${winningPlayers[0].score}!`;

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
              type: pushType
            },
            channelId: "game-messages"
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
            const ticketsWithTypes = tickets.map(ticket => ({
              type: "Press Luck Winner",
              ...ticket
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

    return true;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  currentPressLuckTopic,
  savePressLuckHighScore
};
