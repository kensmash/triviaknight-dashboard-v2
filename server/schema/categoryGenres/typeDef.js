const { gql } = require("apollo-server-express");

const typeDef = gql`
  type CategoryGenre {
    _id: ID
    name: String
    playable: Boolean
    questactive: Boolean
    categorytypes: [CategoryType]
    categories: [Category]
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
    pressluckactive: Boolean
  }

  extend type Mutation {
    upsertcategorygenre(input: upsertCategoryGenreInput): CategoryGenre
    deletecategorygenre(id: ID!): CategoryGenre
  }
`;

module.exports = {
  typeDef,
};
