const { gql } = require("apollo-server-express");

const typeDef = gql`
  type Category {
    _id: ID
    name: String
    description: String
    type: CategoryType
    genres: [CategoryGenre]
    questions: [Question]
    followers: [User]
    createdAt: String
    updatedAt: String
    published: Boolean
    popular: Boolean
    partycategory: Boolean
    showasnew: Boolean
    showasupdated: Boolean
    showaspopular: Boolean
    joustexclusive: Boolean
    pressluckactive: Boolean
  }

  type CategoryPageResponse {
    pages: Int!
    totalrecords: Int!
    categories: [Category]
  }

  type CategoryWidgetResponse {
    totalcategories: Int!
    unpublishedcategories: Int!
  }

  type CategoriesAndGroupsResponse {
    categories: [Category]!
    groups: [CategoryGroup]
  }

  input categoryPageInput {
    limit: Int!
    offset: Int!
    name: String
    type: ID
    genres: [ID]
    published: Boolean
    partycategory: Boolean
  }

  input upsertCategoryInput {
    id: ID
    name: String!
    imageurl: String
    description: String
    type: ID!
    genres: [ID]
    published: Boolean
    partycategory: Boolean
    showasnew: Boolean
    showasupdated: Boolean
    showaspopular: Boolean
    joustexclusive: Boolean
    pressluckactive: Boolean
  }

  extend type Query {
    categories: [Category]
    categorieswidget: CategoryWidgetResponse
    categoriesandgroups: CategoriesAndGroupsResponse
    tkgamecategories: [Category]
    categorysearch(name: String!): [Category]
    category(id: ID!): Category
    categoriespage(input: categoryPageInput): CategoryPageResponse
  }

  extend type Mutation {
    upsertcategory(input: upsertCategoryInput): Category
    deletecategory(id: ID!): Category
  }
`;

module.exports = {
  typeDef
};
