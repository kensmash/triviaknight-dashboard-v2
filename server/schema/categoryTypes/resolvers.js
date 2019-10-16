const mongoose = require("mongoose");
const CategoryType = require("../../models/CategoryType");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    categoryTypes: requiresAuth.createResolver((parent, args) => {
      return CategoryType.find({})
        .populate("categories")
        .sort({ name: 1 });
    }),

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
          CategoryType.find(queryBuilder(name, hasgenres)).count()
        ]);
        const categoryTypeResults = categorytypes[0];
        const categoryTypeCount = categorytypes[1];
        return {
          pages: Math.ceil(categoryTypeCount / limit),
          totalrecords: categoryTypeCount,
          categorytypes: categoryTypeResults
        };
      }
    ),

    categoryType: requiresAdmin.createResolver((parent, { id }) => {
      return CategoryType.findOne({ _id: id });
    })
  },

  Mutation: {
    addcategorytype: requiresAdmin.createResolver(async (parent, { input }) => {
      try {
        const categorytype = new CategoryType(input);
        const newCategoryType = await categorytype.save();
        return newCategoryType;
      } catch (error) {
        console.error(error);
      }
    }),

    editcategorytype: requiresAdmin.createResolver(
      async (parent, { input }) => {
        try {
          const editCategoryType = await CategoryType.findOneAndUpdate(
            { _id: input.id },
            {
              $set: {
                name: input.name,
                iconname: input.iconname,
                iconset: input.iconset,
                hasgenres: input.hasgenres,
                playable: input.playable
              }
            },
            { new: true }
          );
          return editCategoryType;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletecategorytype: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedCategoryType = await CategoryType.findByIdAndRemove({
          _id: id
        });
        return deletedCategoryType;
      } catch (error) {
        console.error(error);
      }
    })
  }
};

module.exports = {
  resolvers
};
