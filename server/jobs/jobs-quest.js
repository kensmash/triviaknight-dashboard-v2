const mongoose = require("mongoose");
const schedule = require("node-schedule");
const User = require("../models/User");
const CategoryGenre = require("../models/CategoryGenre");
const CategoryType = require("../models/CategoryType");
const Category = require("../models/Category");
const {
  currentQuestTopic,
  nextQuestTopic,
  saveQuestHighScore,
} = require("../schema/_helpers/helper-gamesquest");
const ExpoPushTicket = require("../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");

//change Quest topic
const changeQuestTopic = schedule.scheduleJob(
  "59 23 * * 7", // run sunday 1 minute before midnight
  //"*/8 * * * *", //every 5 minutes
  async () => {
    console.log("running change quest topic");
    //take care of previous topic
    const currentTopic = await currentQuestTopic();

    await saveQuestHighScore(currentTopic.topic);
    //now get next topic
    const nextTopic = await nextQuestTopic();
    //unset current quest active
    if (currentTopic.type === "Category") {
      await Category.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(currentTopic.id),
        },
        { $set: { questactive: false } }
      );
    } else if (currentTopic.type === "Genre") {
      await CategoryGenre.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(currentTopic.id),
        },
        { $set: { questactive: false } }
      );
    } else {
      await CategoryType.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(currentTopic.id),
        },
        { $set: { questactive: false } }
      );
    }

    //set new current quest active and unset next quest active
    if (Object.keys(nextTopic).length) {
      if (nextTopic.type === "Category") {
        await Category.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(nextTopic.id),
          },
          { $set: { questactive: true, nextquestactive: false } }
        );
      } else if (nextTopic.type === "Genre") {
        await CategoryGenre.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(nextTopic.id),
          },
          { $set: { questactive: true, nextquestactive: false } }
        );
      } else {
        await CategoryType.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(nextTopic.id),
          },
          { $set: { questactive: true, nextquestactive: false } }
        );
      }
    } else {
      //get random category if no next topic!
      const newCat = await Category.aggregate([
        {
          $match: {
            published: { $eq: true },
            partycategory: { $eq: false },
            joustexclusive: { $eq: false },
            _id: { $ne: mongoose.Types.ObjectId(currentTopic.id) },
          },
        },
        { $sample: { size: 1 } },
      ]);

      if (newCat.length) {
        await Category.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(newCat[0]._id),
          },
          { $set: { questactive: true, nextquestactive: false } }
        );
      }
    }
  }
);

//send notification for weekly Quest topic
const weeklyQuestTopicNotification = schedule.scheduleJob(
  "0 18 * * 1", // run Mondays after noon
  //"*/5 * * * *", //every 5 minutes
  async () => {
    const currentTopic = await currentQuestTopic();
    const topic = currentTopic.topic;
    if (topic) {
      //find users in database
      const users = await User.find({
        "preferences.acceptsweeklypushnotifications": true,
      });
      //get their expoPushTokens
      if (users.length) {
        let pushTokens = [];
        users.forEach(
          (user) => (pushTokens = pushTokens.concat(user.expoPushTokens))
        );

        //send them a push notification
        const expo = new Expo();
        let messages = [];
        const pushMessage = `This week’s Quest topic is ${topic}! Play to win gems!`;

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
              title: "New Categories",
              text: pushMessage,
              type: "New Categories",
            },
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
              type: "New Quest Topic",
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

//send weekly winner notification
const weeklyHighScoreNotification = schedule.scheduleJob(
  "0 14 * * 1", // run Mondays in the morning, i hope
  //"*/5 * * * *", //every 5 minutes
  async () => {
    let lastWeeksTopic = "";
    let results = [];
    //date stuff
    var lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 8);

    //find last week's topic
    const allPreviousWinners = await User.find({
      questhighscores: { $exists: true, $ne: [] },
      "preferences.acceptsweeklypushnotifications": true,
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
      "preferences.acceptsweeklypushnotifications": true,
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

      //Send push notification to winners
      const expo = new Expo();
      let pushTokens = [];

      winners.forEach(
        (user) => (pushTokens = pushTokens.concat(user.expoPushTokens))
      );

      //push notifications
      let messages = [];
      let pushType = "QuestWinner";
      let pushTitle = `You won!`;
      let pushMessage = `Congratulations! You won this past week’s ${lastWeeksTopic} Quest with your score of ${results[0].highscore}!`;

      if (winners.length > 1) {
        pushMessage = `You tied for this past week’s ${lastWeeksTopic} Quest with your score of ${results[0].highscore}!`;
      }

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
            type: "Quest Winner",
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
);

module.exports = {
  weeklyQuestTopicNotification,
  weeklyHighScoreNotification,
  changeQuestTopic,
};
