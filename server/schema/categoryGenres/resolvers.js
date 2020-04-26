const mongoose = require("mongoose");
const CategoryGenre = require("../../models/CategoryGenre");
const CategoryType = require("../../models/CategoryType");
const Category = require("../../models/Category");
//auth helpers
const {
  requiresAuth,
  requiresAdmin,
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    categoryGenres: (parent, args) => {
      return CategoryGenre.find({})
        .sort({ name: 1 })
        .populate("categorytypes")
        .populate("categories");
    },

    categoryGenresPage: requiresAuth.createResolver(
      async (parent, { offset, limit, name, categorytypes }) => {
        const queryBuilder = (name, categorytypes) => {
          const query = {};
          if (name !== "") {
            query.$text = { $search: name };
          }
          if (categorytypes.length) {
            query.categorytypes = { $all: categorytypes };
          }
          return query;
        };
        try {
          const categorygenres = await Promise.all([
            CategoryGenre.find(queryBuilder(name, categorytypes))
              .sort({ name: 1 })
              .skip(offset)
              .limit(limit)
              .populate("categorytypes"),
            CategoryGenre.countDocuments(queryBuilder(name, categorytypes)),
          ]);
          const categoryGenreResults = categorygenres[0];
          const categoryGenreCount = categorygenres[1];
          return {
            pages: Math.ceil(categoryGenreCount / limit),
            totalrecords: categoryGenreCount,
            categorygenres: categoryGenreResults,
          };
        } catch (error) {
          console.error(error);
        }
      }
    ),

    categoryGenre: requiresAdmin.createResolver((parent, { id }) => {
      return CategoryGenre.findOne({ _id: id }).populate("categorytypes");
    }),

    pressYourLuckGenre: requiresAuth.createResolver((parent, { args }) => {
      return CategoryGenre.findOne({ pressluckactive: { $eq: true } });
    }),
  },

  Mutation: {
    upsertcategorygenre: requiresAdmin.createResolver(
      async (parent, { input }, { expo }) => {
        try {
          if (input.nextquestactive) {
            //then reset quest active on other types
            await CategoryGenre.updateMany({
              $set: { nextquestactive: false },
            });
            await CategoryType.updateMany({
              $set: { nextquestactive: false },
            });
            await Category.updateMany({
              $set: { nextquestactive: false },
            });
          }
          const upsertedCategoryGenre = await CategoryGenre.findOneAndUpdate(
            {
              _id: mongoose.Types.ObjectId(input.id),
            },
            input,
            { upsert: true, new: true }
          );

          return upsertedCategoryGenre;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletecategorygenre: requiresAdmin.createResolver(
      async (parent, { id }) => {
        try {
          const deletedCategoryGenre = await CategoryGenre.deleteOne({
            _id: id,
          });
          return deletedCategoryGenre;
        } catch (error) {
          console.error(error);
        }
      }
    ),
  },
};

module.exports = {
  resolvers,
};
