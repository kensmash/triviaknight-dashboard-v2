const schedule = require("node-schedule");
const Category = require("../models/Category");
const User = require("../models/User");
const ExpoPushTicket = require("../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");

//send notification for new categories
const newCategories = schedule.scheduleJob(
  "0 16 * * 0", // run Sundays at noon
  //"*/5 * * * *", //every 5 minutes
  async () => {
    const categories = await Category.find({
      published: { $eq: true },
      partycategory: { $eq: false },
      showasnew: { $eq: true },
      newpushsent: { $eq: false }
    });

    if (categories.length) {
      const trimmedcats = categories
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
      const catnames = trimmedcats.map(cat => cat.name).join(", ");
      //find users in database
      const users = await User.find({});
      //get their expoPushTokens
      if (users.length) {
        let pushTokens = [];
        users.forEach(
          user => (pushTokens = pushTokens.concat(user.expoPushTokens))
        );

        //send them a push notification
        const expo = new Expo();
        let messages = [];
        const pushMessage =
          categories.length > 1
            ? `New categories added! Trivia Knight has added ${catnames}. Check them out!`
            : `New category added! Trivia Knight has added ${catnames}. Check it out!`;
        console.log("push message", pushMessage);
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
              type: "New Categories"
            }
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
              type: "New Categories",
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
        //update the categories so we don't send repeat cats in push notification
        Category.update(
          {
            published: { $eq: true },
            partycategory: { $eq: false },
            showasnew: { $eq: true },
            newpushsent: { $eq: false }
          }, // conditions
          {
            newpushsent: true
          },
          {
            multi: true // options
          },
          function(err, count) {
            if (err) {
              console.log(err);
            } else {
              console.log("what did new category function find", count);
            }
          }
        );
      }
    }
  }
);

module.exports = {
  newCategories
};
