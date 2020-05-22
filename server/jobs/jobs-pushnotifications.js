const schedule = require("node-schedule");
const { Expo } = require("expo-server-sdk");
const ExpoPushTicket = require("../models/ExpoPushTicket");
const ExpoPushReceipt = require("../models/ExpoPushReceipt");
const {
  sendPushTicketEmail,
  sendPushReceiptEmail,
} = require("../schema/_helpers/helper-nodemailer");

//check push receipts
const checkPushReceipts = schedule.scheduleJob(
  "0 12 * * *", // run everyday at noon
  //"*/5 * * * *", //every 5 minutes
  async () => {
    console.log("check push receipt function called");
    //retrieve batches of receipts from the Expo service.
    const pushtickets = await ExpoPushTicket.find({});
    if (pushtickets.length) {
      const ids = pushtickets.map((ticket) => ticket.id);
      const expo = new Expo();
      let receiptIdChunks = expo.chunkPushNotificationReceiptIds(ids);
      for (let chunk of receiptIdChunks) {
        try {
          //this is an object of objects for some reason
          let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          //need to convert to array to iterate through
          let receiptsArray = [];
          const obj = JSON.stringify(receipts, function (key, value) {
            receiptsArray.push(value);
          });
          // The receipts specify whether Apple or Google successfully received the
          // notification and information about an error, if one occurred.
          if (receiptsArray.length) {
            for (let receipt of receiptsArray) {
              const receiptId = Object.keys(receipt)[0];
              const receiptInfo = Object.values(receipt);
              //if error, save to database
              if (receiptInfo[0].details && receiptInfo[0].details.error) {
                try {
                  const newreceipt = new ExpoPushReceipt({
                    id: receiptId,
                    status: receiptInfo[0].status,
                    message: receiptInfo[0].message,
                    details: receiptInfo[0].details,
                  });
                  await newreceipt.save();
                  //send email
                  sendPushReceiptEmail(
                    receiptId,
                    receiptInfo[0].message,
                    receiptInfo[0].details
                  );
                } catch (error) {
                  console.error(error);
                }
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
);

//check for push tickets that have errors
const pushTicketErrorCheck = schedule.scheduleJob(
  "1 12 * * *", // run everyday at noon
  async () => {
    console.log("push ticket error check function called");
    const pushticketerrors = await ExpoPushTicket.find({
      status: { $ne: "ok" },
    });
    if (pushticketerrors.length) {
      const pushids = pushticketerrors.map((ticket) => ticket.id);
      //send email
      sendPushTicketEmail(pushids);
    }
  }
);

//delete push tickets that are older than 2 days
const deletePushTickets = schedule.scheduleJob(
  "0 22 * * *", // run everyday at 10
  () => {
    console.log("delete push tickets function called");
    ExpoPushTicket.deleteMany(
      {
        createdAt: {
          $lte: new Date(Date.now() - 2),
        },
      },
      function (err) {
        if (err) return console.error(err);
      }
    );
  }
);

module.exports = {
  checkPushReceipts,
  pushTicketErrorCheck,
  deletePushTickets,
};
