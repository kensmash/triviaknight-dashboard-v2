const Question = require("../../models/Question");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
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
            Question.find(
              queryBuilder(question, category, difficulty, type, published)
            ).count()
          ]);

          const questionResults = questions[0];
          const questionCount = questions[1];

          return {
            pages: Math.ceil(questionCount / limit),
            totalrecords: questionCount,
            questions: questionResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    tkgamequestions: requiresAuth.createResolver(async (parent, args) => {
      try {
        const questions = await Question.aggregate([
          {
            $match: {
              published: { $eq: true }
            }
          },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category"
            }
          },
          {
            $match: {
              "category.published": true,
              "category.partycategory": false,
              "category.joustexclusive": false
            }
          },
          { $sample: { size: 250 } },
          {
            $project: {
              question: 1,
              difficulty: 1,
              answers: 1,
              category: { $arrayElemAt: ["$category", 0] }
            }
          }
        ]);
        return questions;
      } catch (error) {
        console.error(error);
      }
    }),

    questionswidget: requiresAdmin.createResolver(async (parent, args) => {
      try {
        const widget = await Promise.all([
          Question.find().count(),
          Question.find({ published: { $eq: false } }).count()
        ]);

        const totalquestions = widget[0];
        const unpublishedquestions = widget[1];

        return {
          totalquestions,
          unpublishedquestions
        };
      } catch (error) {
        console.error(error);
      }
    }),

    question: requiresAdmin.createResolver((parent, { id }) => {
      return Question.findOne({ _id: id }).populate("category");
    })
  },

  Mutation: {
    addquestion: requiresAdmin.createResolver(async (parent, { input }) => {
      try {
        const questiontoadd = new Question(input);
        const newQuestion = await questiontoadd.save();
        return newQuestion;
      } catch (error) {
        console.error(error);
      }
    }),

    editquestion: requiresAdmin.createResolver(async (parent, { input }) => {
      try {
        const editedQuestion = await Question.findOneAndUpdate(
          { _id: input.id },
          {
            $set: {
              question: input.question,
              answers: input.answers,
              category: input.category,
              type: input.type,
              difficulty: input.difficulty,
              imageurl: input.imageurl,
              videourl: input.videourl,
              audiourl: input.audiourl,
              published: input.published
            }
          },
          { new: true }
        );
        return editedQuestion;
      } catch (error) {
        console.error(error);
      }
    }),

    deletequestion: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const foundQuestion = await Question.findById({
          _id: id
        });
        const deletedQuestion = await foundQuestion.remove();
        return deletedQuestion;
      } catch (error) {
        console.error(error);
      }
    })
  }
};

module.exports = {
  resolvers
};
