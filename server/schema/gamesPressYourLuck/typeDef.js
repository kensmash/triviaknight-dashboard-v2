const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GamePressYourLuck {
    _id: ID!
    genre: CategoryGenre
    players: [PlayerPressYourLuck]!
    rounds: Int
    categories: [Category]
    questions: [Question]
    gameover: Boolean
    timedout: Boolean
    createdAt: String
    updatedAt: String
  }

  type PlayerPressYourLuck {
    player: User!
    score: Int
    timedout: Boolean
    resultsseen: Boolean
    roundresults: [RoundResults]
  }

  extend type Query {
    currentpressluckgame(id: ID!): GamePressYourLuck
    pressluckgamepage(
      limit: Int!
      offset: Int!
      player: ID
      gameover: Boolean
    ): PressLuckGamePageResponse
  }

  type PressLuckGamePageResponse {
    pages: Int!
    totalrecords: Int!
    pressluckgames: [GamePressYourLuck]
  }

  extend type Mutation {
    createpressluckgame(genre: ID!): GamePressYourLuck
    enterpressluckanswer(
      gameid: ID!
      roundresults: RoundResultsInput!
      advance: Boolean!
    ): GamePressYourLuck
    endpressluckgame(gameid: ID!, points: Int!): GamePressYourLuck
    pressluckresultsseen(gameid: ID!): GamePressYourLuck
    expirepressluckgame(gameid: ID!): GamePressYourLuck
    deletepressluckgame(gameid: ID!): GamePressYourLuck
  }
`;

module.exports = {
  typeDef
};
