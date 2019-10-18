const QuestionReport = require("../../models/QuestionReport");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    questionreports: requiresAuth.createResolver((parent, args) => {
      return QuestionReport.find({}).populate("question");
    }),

    questionReportsPage: requiresAdmin.createResolver(
      async (parent, { offset, limit, updated }) => {
        const queryBuilder = updated => {
          const query = {};
          if (updated) {
            query.questionupdated = { $eq: updated };
          }
          return query;
        };
        try {
          const reports = await Promise.all([
            QuestionReport.find(queryBuilder(updated))
              .skip(offset)
              .limit(limit)
              .populate("question"),
            QuestionReport.find(queryBuilder(updated)).count()
          ]);
          const reportResults = reports[0];
          const reportCount = reports[1];
          return {
            pages: Math.ceil(reportCount / limit),
            totalrecords: reportCount,
            reports: reportResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    questionreportswidget: requiresAdmin.createResolver(
      async (parent, args) => {
        try {
          const widget = await Promise.all([QuestionReport.find().count()]);

          const totalreports = widget[0];

          return {
            totalreports
          };
        } catch (error) {
          console.error(error);
        }
      }
    )
  },

  Mutation: {
    createreport: requiresAuth.createResolver(
      async (parent, { question, message }, { user }) => {
        try {
          const questionReport = new QuestionReport({
            question,
            reportedby: user.id,
            message
          });
          const newQuestionReport = await questionReport.save();
          return newQuestionReport;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletequestionreport: requiresAdmin.createResolver(
      async (parent, { id }) => {
        try {
          const deletedQuestion = await QuestionReport.findByIdAndRemove({
            _id: id
          });
          return deletedQuestion;
        } catch (error) {
          console.error(error);
        }
      }
    )
  }
};

module.exports = {
  resolvers
};
