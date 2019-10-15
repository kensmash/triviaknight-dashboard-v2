const Category = require("../../models/Category");
const mongoose = require("mongoose");
//auth helpers
const {
  requiresAuth,
  requiresAdmin
} = require("../_helpers/helper-permissions");

const resolvers = {
  Query: {
    categories: requiresAuth.createResolver((parent, args) => {
      return Category.find({})
        .sort({ createdAt: -1 })
        .populate("type")
        .populate("genres");
    }),

    categoriespage: requiresAuth.createResolver(async (parent, { input }) => {
      const queryBuilder = input => {
        const query = {};
        if (input.name !== "") {
          query.$text = { $search: input.name };
        }
        if (input.type) {
          query.type = { $in: input.type };
        }
        if (input.genres.length) {
          query.genres = { $all: input.genres };
        }
        if (input.partycategory !== null) {
          query.partycategory = { $eq: input.partycategory };
        }

        return query;
      };
      const categories = await Promise.all([
        Category.find(queryBuilder(input))
          .sort({ _id: -1 }) //name: 1
          .skip(input.offset)
          .limit(input.limit)
          .populate("type")
          .populate("genres"),
        Category.find(queryBuilder(input)).count()
      ]);
      const categoryResults = categories[0];
      const categoryCount = categories[1];
      return {
        pages: Math.ceil(categoryCount / input.limit),
        totalrecords: categoryCount,
        categories: categoryResults
      };
    }),

    categorieswidget: requiresAdmin.createResolver(async (parent, args) => {
      try {
        const widget = await Promise.all([
          Category.find().count(),
          Category.find({ published: { $eq: false } }).count()
        ]);

        const totalcategories = widget[0];
        const unpublishedcategories = widget[1];

        return {
          totalcategories,
          unpublishedcategories
        };
      } catch (error) {
        console.error(error);
      }
    }),

    tkgamecategories: requiresAuth.createResolver(
      (parent, { args }, { user }) => {
        return Category.find({
          published: { $eq: true },
          partycategory: { $eq: false }
        })
          .sort({ name: 1 })
          .populate("type")
          .populate("genres");
      }
    ),

    categorysearch: requiresAuth.createResolver((parent, { name }) => {
      return Category.find({
        $text: { $search: name },
        published: { $eq: true },
        partycategory: { $eq: false }
      })
        .sort({ name: 1 })
        .populate("type");
    }),

    category: requiresAuth.createResolver((parent, { id }) => {
      return Category.findOne({ _id: id })
        .populate("type")
        .populate("genres")
        .populate("followers");
    })
  },

  Mutation: {
    addcategory: requiresAdmin.createResolver(async (parent, { input }) => {
      try {
        const category = await new Category(input);
        const newCategory = await category.save();
        return newCategory;
      } catch (error) {
        console.error(error);
      }
    }),

    upsertcategory: requiresAdmin.createResolver(async (parent, { input }) => {
      try {
        await Category.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(input.id)
          },
          input,
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(error);
      }
    }),

    editcategory: requiresAdmin.createResolver(
      async (parent, { input }, context) => {
        try {
          const editedCategory = await Category.findOneAndUpdate(
            { _id: input.id },
            {
              $set: {
                name: input.name,
                imageurl: input.imageurl,
                description: input.description,
                type: input.type,
                genres: input.genres,
                published: input.published,
                partycategory: input.partycategory,
                showasnew: input.showasnew,
                showasupdated: input.showasupdated,
                showaspopular: input.showaspopular,
                joustexclusive: input.joustexclusive
              }
            },
            { new: true }
          );

          return editedCategory;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletecategory: requiresAdmin.createResolver(async (parent, { id }) => {
      try {
        const deletedCategory = await Category.findByIdAndRemove({
          _id: id
        });
        return deletedCategory;
      } catch (error) {
        console.error(error);
      }
    })
  }
};

module.exports = {
  resolvers
};
