const ExpoPushTicket = require("../../models/ExpoPushTicket");
const ExpoPushReceipt = require("../../models/ExpoPushReceipt");
//auth helpers
const { requiresAdmin } = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    pushTicketsPage: requiresAdmin.createResolver(
      async (parent, { offset, limit, type, receiptFetched }) => {
        const queryBuilder = (type, receiptFetched) => {
          const query = {};
          if (type) {
            query.type = { $in: type };
          }
          if (receiptFetched) {
            query.receiptFetched = { $eq: true };
          }
          return query;
        };
        try {
          const tickets = await Promise.all([
            ExpoPushTicket.find(queryBuilder(type, receiptFetched))
              .skip(offset)
              .limit(limit),
            ExpoPushTicket.countDocuments(queryBuilder(type, receiptFetched))
          ]);
          const ticketResults = tickets[0];
          const ticketCount = tickets[1];
          return {
            pages: Math.ceil(ticketCount / limit),
            totalrecords: ticketCount,
            tickets: ticketResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    pushticketswidget: requiresAdmin.createResolver(async (parent, args) => {
      try {
        const ticketswitherrors = ExpoPushTicket.countDocuments({
          status: { $ne: "ok" }
        });

        return { ticketswitherrors };
      } catch (error) {
        console.error(error);
      }
    }),

    pushReceiptsPage: requiresAdmin.createResolver(
      async (parent, { offset, limit, type }) => {
        const queryBuilder = type => {
          const query = {};
          if (type) {
            query.type = { $in: type };
          }
          return query;
        };
        try {
          const receipts = await Promise.all([
            ExpoPushReceipt.find(queryBuilder(type))
              .skip(offset)
              .limit(limit),
            ExpoPushReceipt.find(queryBuilder(type)).count()
          ]);

          const receiptResults = receipts[0];
          const receiptCount = receipts[1];
          return {
            pages: Math.ceil(receiptCount / limit),
            totalrecords: receiptCount,
            receipts: receiptResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    pushreceiptswidget: requiresAdmin.createResolver(async (parent, args) => {
      try {
        const receiptswitherrors = ExpoPushReceipt.estimatedDocumentCount();

        return { receiptswitherrors };
      } catch (error) {
        console.error(error);
      }
    })
  },

  Mutation: {
    fetchreceipts: requiresAdmin.createResolver((parent, { ids }, { expo }) => {
      (async () => {
        //retrieve batches of receipts from the Expo service.
        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(ids);
        for (let chunk of receiptIdChunks) {
          try {
            //this is an object of objects for some reason
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            //need to convert to array to iterate through

            let receiptsArray = [];
            const obj = JSON.stringify(receipts, function(key, value) {
              receiptsArray.push(value);
            });

            // The receipts specify whether Apple or Google successfully received the
            // notification and information about an error, if one occurred.
            for (let receipt of receiptsArray) {
              const receiptId = Object.keys(receipt)[0];
              const receiptInfo = Object.values(receipt);

              if (receiptInfo[0].status === "ok") {
                try {
                  //save response tickets to database for later retrieval
                  const newreceipt = new ExpoPushReceipt({
                    id: receiptId,
                    status: receiptInfo[0].status
                  });
                  const savedReceipt = await newreceipt.save();
                } catch (error) {
                  console.error(error);
                }
              } else if (
                receiptInfo[0].details &&
                receiptInfo[0].details.error
              ) {
                try {
                  //save response tickets to database for later retrieval
                  const newreceipt = new ExpoPushReceipt({
                    id: receiptId,
                    status: receiptInfo[0].status,
                    message: receiptInfo[0].message,
                    details: receiptInfo[0].details
                  });
                  const savedReceipt = await newreceipt.save();
                } catch (error) {
                  console.error(error);
                }
              }
            }
          } catch (error) {
            console.error(error);
          }
        }
        for (let id of ids) {
          try {
            await ExpoPushTicket.findOneAndUpdate(
              { id: id },
              { $set: { receiptFetched: true } }
            );
          } catch (error) {
            console.error(error);
          }
        }
      })();
      return true;
    }),

    deletepushticket: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedTicket = await ExpoPushTicket.deleteOne({
          _id: id
        });
        return deletedTicket;
      } catch (error) {
        console.error(error);
      }
    }),

    deletetickets: requiresAdmin.createResolver(async (parent, { ids }) => {
      try {
        await ExpoPushTicket.deleteMany({
          _id: ids
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }),

    deletepushreceipt: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedReceipt = await ExpoPushReceipt.deleteOne({
          _id: id
        });
        return deletedReceipt;
      } catch (error) {
        console.error(error);
      }
    }),

    deletereceipts: requiresAdmin.createResolver(async (parent, { ids }) => {
      try {
        await ExpoPushReceipt.deleteMany({
          _id: ids
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    })
  }
};

module.exports = {
  resolvers
};
