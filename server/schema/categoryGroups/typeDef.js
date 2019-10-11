const { gql } = require("apollo-server-express");

const typeDef = gql`
  type CategoryGroup {
    _id: ID!
    name: String!
    displaytext: String!
    active: Boolean
    categories: [Category]
    updatedAt: String
  }

  type CategoryGroupPageResponse {
    pages: Int!
    totalrecords: Int!
    categorygroups: [CategoryGroup]
  }

  input addCategoryGroupInput {
    name: String!
    displaytext: String!
    categories: [ID]
    active: Boolean
  }

  input editCategoryGroupInput {
    id: ID!
    name: String!
    displaytext: String!
    categories: [ID]
    active: Boolean
  }

  extend type Query {
    categoryGroups: [CategoryGroup]
    categoryGroup(id: ID!): CategoryGroup
    categoryGroupsPage(limit: Int!, offset: Int!): CategoryGroupPageResponse
  }

  extend type Mutation {
    addcategorygroup(input: addCategoryGroupInput): CategoryGroup
    editcategorygroup(input: editCategoryGroupInput): CategoryGroup
    deletecategorygroup(id: ID!): CategoryGroup
  }
`;

module.exports = {
  typeDef
};
