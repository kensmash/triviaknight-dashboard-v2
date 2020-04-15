const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameJoust {
    _id: ID!
    type: String
    createdby: User
    players: [PlayerJoust]!
    rounds: Int
    category: Category
    questions: [Question]
    gameover: Boolean
    accepted: Boolean
    declined: Boolean
    timedout: Boolean
    createdAt: String
    updatedAt: String
  }

  type PlayerJoust {
    player: User!
    joined: Boolean
    turn: Boolean!
    tied: Boolean
    winner: Boolean
    timedout: Boolean
    resultsseen: Boolean
    roundresults: [RoundResults]
    boosts: [String]
    advantages: [String]
  }

  input JoustResultsInput {
    win: Int
    loss: Int
    tie: Int
    questionsanswered: Int
    correctanswers: Int
    incorrectanswers: Int
  }

  input createJoustGameInput {
    opponentid: ID!
    category: ID!
  }

  input completeJoustGameInput {
    gameid: ID!
    opponentid: ID!
    opponentpushtokens: [String]
    tie: Boolean!
    winnerid: ID
  }

  extend type Query {
    alljoustgames: [GameJoust]
    currentjoustgame(id: ID!): GameJoust
    joustgamepage(
      limit: Int!
      offset: Int!
      players: [ID]
      gameover: Boolean
    ): JoustGamePageResponse
  }

  type JoustQuestionResponse {
    error: GameJoustError
    game: GameJoust
  }

  type JoustEndedPaginationResponse {
    items: [GameJoust]
    hasMore: Boolean
  }

  type GameJoustError {
    msg: String!
  }

  type JoustGamePageResponse {
    pages: Int!
    totalrecords: Int!
    joustgames: [GameJoust]
  }

  extend type Mutation {
    createjoustgame(input: createJoustGameInput!): GameJoust
    joinjoustgame(gameid: ID!): GameJoust
    declinejoustgame(gameid: ID!): GameJoust
    selectjoustadvantage(gameid: ID!, advantage: String!, gems: Int!): GameJoust
    enterjoustanswerandadvance(
      gameid: ID!
      roundresults: RoundResultsInput!
      advance: Boolean!
    ): GameJoust
    resignjoustgame(gameid: ID!): GameJoust
    joustresultsseen(gameid: ID!): GameJoust
    expirejoustgame(gameid: ID!): GameJoust
    deletejoustgame(gameid: ID!): GameJoust
  }
`;

module.exports = {
  typeDef,
};
