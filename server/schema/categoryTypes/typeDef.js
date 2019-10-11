const { gql } = require("apollo-server-express");

const typeDef = gql`
  type CategoryType {
    _id: ID!
    name: String!
    playable: Boolean
    iconname: String
    iconset: String
    imageurl: String
    hasgenres: Boolean
    categories: [Category]
  }

  type CategoryTypePageResponse {
    pages: Int!
    totalrecords: Int!
    categorytypes: [CategoryType]
  }

  extend type Query {
    categoryTypes: [CategoryType]
    categoryType(id: ID!): CategoryType
    categoryTypesPage(
      limit: Int!
      offset: Int!
      name: String
      hasgenres: String
    ): CategoryTypePageResponse
  }

  input addCategoryTypeInput {
    name: String!
    iconname: String
    iconset: String
    hasgenres: Boolean!
    playable: Boolean
  }

  input editCategoryTypeInput {
    id: ID!
    name: String!
    iconname: String
    iconset: String
    hasgenres: Boolean!
    playable: Boolean
  }

  extend type Mutation {
    addcategorytype(input: addCategoryTypeInput): CategoryType
    editcategorytype(input: editCategoryTypeInput): CategoryType
    deletecategorytype(id: ID!): CategoryType
  }
`;

module.exports = {
  typeDef
};
