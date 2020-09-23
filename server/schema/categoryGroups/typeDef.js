const { gql } = require("apollo-server-express");

const typeDef = gql`
  type CategoryGroup {
    _id: ID!
    name: String!
    iconname: String
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

  input upsertCategoryGroupInput {
    id: ID
    name: String!
    displaytext: String!
    categories: [ID]
    active: Boolean
    iconname: String
  }

  extend type Query {
    categoryGroups: [CategoryGroup]
    categoryGroup(id: ID!): CategoryGroup
    categoryGroupsPage(limit: Int!, offset: Int!): CategoryGroupPageResponse
  }

  extend type Mutation {
    upsertcategorygroup(input: upsertCategoryGroupInput): CategoryGroup
    deletecategorygroup(id: ID!): CategoryGroup
  }
`;

module.exports = {
  typeDef,
};
