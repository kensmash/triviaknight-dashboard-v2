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
            CategoryGroup.find(queryBuilder()).count()
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
    addcategorygroup: requiresAdmin.createResolver(
      async (parent, { input }) => {
        try {
          const categorygroup = await new CategoryGroup(input);

          const newCategoryGroup = await categorygroup.save();
          return newCategoryGroup;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    editcategorygroup: requiresAdmin.createResolver(
      async (parent, { input }, context) => {
        try {
          const editedCategoryGroup = await CategoryGroup.findOneAndUpdate(
            { _id: input.id },
            {
              $set: {
                name: input.name,
                displaytext: input.displaytext,
                categories: input.categories,
                active: input.active
              }
            },
            { new: true }
          );

          return editedCategoryGroup;
        } catch (error) {
          console.error(error);
        }
      }
    ),

    deletecategorygroup: requiresAdmin.createResolver(
      async (parent, { id }) => {
        try {
          const deletedCategoryGroup = await CategoryGroup.findByIdAndRemove({
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
