const { gql } = require("apollo-server-express");

const typeDef = gql`
  type CategoryGenre {
    _id: ID
    name: String
    playable: Boolean
    categorytypes: [CategoryType]
    categories: [Category]
    questactive: Boolean
    questdescription: String
    nextquestactive: Boolean
  }

  type CategoryGenrePageResponse {
    pages: Int!
    totalrecords: Int!
    categorygenres: [CategoryGenre]
  }

  extend type Query {
    categoryGenres: [CategoryGenre]
    pressYourLuckGenre: CategoryGenre
    categoryGenre(id: ID!): CategoryGenre
    categoryGenresPage(
      limit: Int!
      offset: Int!
      name: String
      categorytypes: [ID]
    ): CategoryGenrePageResponse
    genresintype(type: ID!): [CategoryGenre]
  }

  input upsertCategoryGenreInput {
    id: ID
    name: String!
    categorytypes: [ID!]
    playable: Boolean
    nextquestactive: Boolean
  }

  extend type Mutation {
    upsertcategorygenre(input: upsertCategoryGenreInput): CategoryGenre
    deletecategorygenre(id: ID!): CategoryGenre
  }
`;

module.exports = {
  typeDef,
};
