const { gql } = require("apollo-server-express");

const typeDef = gql`
  type CategoryGenre {
    _id: ID
    name: String
    playable: Boolean
    pressluckactive: Boolean
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

  input addCategoryGenreInput {
    name: String
    categorytypes: [ID]
    playable: Boolean
    pressluckactive: Boolean
  }

  input editCategoryGenreInput {
    id: ID!
    name: String!
    categorytypes: [ID!]
    playable: Boolean
    pressluckactive: Boolean
  }

  extend type Mutation {
    addcategorygenre(input: addCategoryGenreInput): CategoryGenre
    editcategorygenre(input: editCategoryGenreInput): CategoryGenre
    deletecategorygenre(id: ID!): CategoryGenre
  }
`;

module.exports = {
  typeDef
};
