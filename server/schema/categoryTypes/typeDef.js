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
    questactive: Boolean
    questdescription: String
    nextquestactive: Boolean
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

  input upsertCategoryTypeInput {
    id: ID
    name: String!
    iconname: String
    iconset: String
    hasgenres: Boolean!
    playable: Boolean
    nextquestactive: Boolean
  }

  extend type Mutation {
    upsertcategorytype(input: upsertCategoryTypeInput): CategoryType
    deletecategorytype(id: ID!): CategoryType
  }
`;

module.exports = {
  typeDef,
};
