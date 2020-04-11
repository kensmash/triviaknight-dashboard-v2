const mongoose = require("mongoose");
const CategoryType = require("../../models/CategoryType");
const Category = require("../../models/Category");
const CategoryGenre = require("../../models/CategoryGenre");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");
//press luck helpers
const { currentPressLuckTopic } = require("../_helpers/helper-gamespressluck");
const { savePressLuckHighScore } = require("../_helpers/helper-gamespressluck");

const resolvers = {
  Query: {
    categoryTypes: (parent, args) => {
      return CategoryType.find({}).populate("categories").sort({ name: 1 });
    },

    categoryTypesPage: requiresAuth.createResolver(
      async (parent, { offset, limit, name, hasgenres }) => {
        const queryBuilder = (name, hasgenres) => {
          const query = {};
          if (name !== "") {
            query.$text = { $search: name };
          }
          if (hasgenres !== "") {
            query.hasgenres = { $eq: hasgenres };
          }
          return query;
        };
        const categorytypes = await Promise.all([
          CategoryType.find(queryBuilder(name, hasgenres))
            .sort({ name: 1 })
            .skip(offset)
            .limit(limit),
          CategoryType.countDocuments(queryBuilder(name, hasgenres)),
        ]);
        const categoryTypeResults = categorytypes[0];
        const categoryTypeCount = categorytypes[1];
        return {
          pages: Math.ceil(categoryTypeCount / limit),
          totalrecords: categoryTypeCount,
          categorytypes: categoryTypeResults,
        };
      }
    ),

    categoryType: requiresAdmin.createResolver((parent, { id }) => {
      return CategoryType.findOne({ _id: id });
    }),
  },

  Mutation: {
    upsertcategorytype: requiresAdmin.createResolver(
      async (parent, { input }, { expo }) => {
        try {
          if (input.pressluckactive) {
            //first, save player high score from previous week
            const currentTopic = await currentPressLuckTopic();
            await savePressLuckHighScore(currentTopic.topic, expo);
            //then reset press luck active on other genres
            //then reset press luck active on other types
            await CategoryGenre.updateMany({
              $set: { pressluckactive: false },
            });
            await CategoryType.updateMany({
              $set: { pressluckactive: false },
            });
            await Category.updateMany({
              $set: { pressluckactive: false },
            });
          }
          const upsertedCategoryType = await CategoryType.findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(input.id),
            },
            input,
            { upsert: true, new: true }
          );

          return upsertedCategoryType;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletecategorytype: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedCategoryType = await CategoryType.deleteOne({
          _id: id,
        });
        return deletedCategoryType;
      } catch (error) {
        console.error(error);
      }
    }),
  },
};

module.exports = {
  resolvers,
};
