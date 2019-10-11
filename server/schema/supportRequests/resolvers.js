const SupportRequest = require("../../models/SupportRequest");
//auth helpers
const { requiresAdmin } = require("../_helpers/helper-permissions");
//resolver helpers
const {
  sendSupportRequestResponseEmail
} = require("../_helpers/helper-sendgrid");

const resolvers = {
  Query: {
    supportRequestPage: requiresAdmin.createResolver(
      async (parent, { offset, limit, replysent, resolved }) => {
        const queryBuilder = (replysent, resolved) => {
          const query = {};
          if (replysent) {
            query.replysent = { $eq: replysent };
          }
          if (resolved) {
            query.resolved = { $eq: resolved };
          }
          return query;
        };
        try {
          const requests = await Promise.all([
            SupportRequest.find(queryBuilder(replysent, resolved))
              .skip(offset)
              .limit(limit),
            SupportRequest.find(queryBuilder(replysent, resolved)).count()
          ]);
          const requestResults = requests[0];
          const requestCount = requests[1];

          return {
            pages: Math.ceil(requestCount / limit),
            totalrecords: requestCount,
            requests: requestResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    supportrequestswidget: requiresAdmin.createResolver(
      async (parent, args) => {
        try {
          const widget = await Promise.all([
            SupportRequest.find({ resolved: { $eq: false } }).count(),
            SupportRequest.find({ replysent: { $eq: false } }).count()
          ]);

          const openrequests = widget[0];
          const newrequests = widget[1];

          return { openrequests, newrequests };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    supportrequest: requiresAdmin.createResolver((parent, { id }) => {
      return SupportRequest.findOne({ _id: id });
    })
  },

  Mutation: {
    sendreply: requiresAdmin.createResolver(
      async (parent, { id, to, subject, reply }) => {
        await sendSupportRequestResponseEmail(to, subject, reply);
        try {
          const response = await SupportRequest.findOneAndUpdate(
            { _id: id },
            {
              $set: { replysent: true }
            },
            { new: true }
          );
          return response;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deleterequest: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedRequest = await SupportRequest.findByIdAndRemove({
          _id: id
        });
        return deletedRequest;
      } catch (error) {
        console.error(error);
      }
    })
  }
};

module.exports = {
  resolvers
};
