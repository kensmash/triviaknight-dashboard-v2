const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameSolo {
    _id: ID!
    players: [PlayerSolo]!
    rounds: Int
  }

  type PlayerSolo {
    player: User!
    score: Int!
    answered: Boolean
    resultsseen: Boolean
    roundresults: [RoundResults]
  }

  type RoundResults {
    question: Question
    difficulty: String
    category: Category
    answer: String
    correct: Boolean
    points: Int
    answertype: String
  }

  input RoundResultsInput {
    question: ID
    difficulty: String
    category: ID
    correct: Boolean
    points: Int
  }

  extend type Query {
    allsologames: [GameSolo]
    newsologame: NewSoloGameResponse
    currentgame(id: ID!): GameSolo
  }

  type GameSoloError {
    msg: String!
  }

  type NewSoloGameResponse {
    categories: [Category]
    questions: [Question]
  }

  extend type Mutation {
    savesologame(results: [RoundResultsInput]!): GameSolo
  }
`;

module.exports = {
  typeDef
};
