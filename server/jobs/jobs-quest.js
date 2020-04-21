const schedule = require("node-schedule");
const User = require("../models/User");
const { currentQuestTopic } = require("../schema/_helpers/helper-gamesquest");
const ExpoPushTicket = require("../models/ExpoPushTicket");
const { Expo } = require("expo-server-sdk");

//send notification for weekly Quest topic
const weeklyQuestTopic = schedule.scheduleJob(
  "0 18 * * 1", // run Mondays after noon
  //"*/5 * * * *", //every 5 minutes
  async () => {
    const currentTopic = await currentQuestTopic();
    const topic = currentTopic.topic;
    if (topic) {
      //find users in database
      const users = await User.find({});
      //get their expoPushTokens
      if (users.length) {
        let pushTokens = [];
        users.forEach(
          (user) => (pushTokens = pushTokens.concat(user.expoPushTokens))
        );

        //send them a push notification
        const expo = new Expo();
        let messages = [];
        const pushMessage = `This week’s Quest topic is ${topic}! Play and compare your score!`;
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

module.exports = {
  weeklyQuestTopic,
};
