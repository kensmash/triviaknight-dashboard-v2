const mongoose = require("mongoose");
const CategoryGroup = require("../../models/CategoryGroup");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    categoryGroups: requiresAuth.createResolver((parent, args) => {
      return CategoryGroup.find({})
        .sort({ name: 1 })
        .populate({
          path: "categories",
          populate: { path: "type" }
        });
    }),

    categoryGroupsPage: requiresAdmin.createResolver(
      async (parent, { offset, limit }) => {
        const queryBuilder = () => {
          const query = {};
          return query;
        };
        try {
          const categorygroups = await Promise.all([
            CategoryGroup.find(queryBuilder())
              .sort({ name: 1 })
              .skip(offset)
              .limit(limit)
              .populate("categories"),
            CategoryGroup.countDocuments(queryBuilder())
          ]);
          const categoryGroupResults = categorygroups[0];
          const categoryGroupCount = categorygroups[1];
          return {
            pages: Math.ceil(categoryGroupCount / limit),
            totalrecords: categoryGroupCount,
            categorygroups: categoryGroupResults
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    categoryGroup: requiresAdmin.createResolver((parent, { id }) => {
      return CategoryGroup.findOne({ _id: id }).populate("categories");
    })
  },

  Mutation: {
    upsertcategorygroup: requiresAdmin.createResolver(
      async (parent, { input }) => {
        try {
          const upsertedCategoryGroup = await CategoryGroup.findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(input.id)
            },
            input,
            { upsert: true, new: true }
          );

          return upsertedCategoryGroup;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletecategorygroup: requiresAdmin.createResolver(
      async (parent, { id }) => {
        try {
          const deletedCategoryGroup = await CategoryGroup.deleteOne({
            _id: id
          });
          return deletedCategoryGroup;
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
