const mongoose = require("mongoose");
const Question = require("../../models/Question");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    questionspage: requiresAuth.createResolver(
      async (
        parent,
        { limit, offset, question, category, difficulty, type, published }
      ) => {
        const queryBuilder = (
          question,
          category,
          difficulty,
          type,
          published
        ) => {
          const query = {};

          if (question !== "") {
            query.$text = { $search: question };
          }
          if (category !== "") {
            query.category = { $in: category };
          }
          if (difficulty !== "") {
            query.difficulty = { $eq: difficulty };
          }
          if (type !== "") {
            query.type = { $eq: type };
          }
          if (published !== null) {
            query.published = { $eq: published };
          }

          return query;
        };

        try {
          const questions = await Promise.all([
            Question.find(
              queryBuilder(question, category, difficulty, type, published)
            )
              .limit(limit)
              .skip(offset)
              .populate("category")
              .sort({ _id: -1 }),
            Question.countDocuments(
              queryBuilder(question, category, difficulty, type, published)
            ),
          ]);

          const questionResults = questions[0];
          const questionCount = questions[1];

          return {
            pages: Math.ceil(questionCount / limit),
            totalrecords: questionCount,
            questions: questionResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    questionswidget: requiresAdmin.createResolver(async (parent, args) => {
      try {
        const widget = await Promise.all([
          Question.estimatedDocumentCount(),
          Question.countDocuments({ published: { $eq: false } }),
        ]);

        const totalquestions = widget[0];
        const unpublishedquestions = widget[1];

        return {
          totalquestions,
          unpublishedquestions,
        };
      } catch (error) {
        console.error(error);
      }
    }),

    question: requiresAdmin.createResolver((parent, { id }) => {
      return Question.findOne({ _id: id }).populate("category");
    }),
  },

  Mutation: {
    upsertquestion: requiresAdmin.createResolver(async (parent, { input }) => {
      try {
        const upsertedQuestion = await Question.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(input.id),
          },
          input,
          { upsert: true, new: true }
        );

        return upsertedQuestion;
      } catch (error) {
        console.error(error);
      }
    }),

    deletequestion: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedQuestion = await Question.deleteOne({
          _id: id,
        });

        return deletedQuestion;
      } catch (error) {
        console.error(error);
      }
    }),
  },
};

module.exports = {
  resolvers,
};
