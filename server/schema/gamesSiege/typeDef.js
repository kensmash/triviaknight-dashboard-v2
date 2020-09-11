const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameSiege {
    _id: ID!
    type: String
    createdby: User
    players: [PlayerSiege]!
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

  type PlayerSiege {
    player: User!
    joined: Boolean
    score: Int!
    turn: Boolean!
    turncomplete: Boolean!
    tied: Boolean
    winner: Boolean
    timedout: Boolean
    resultsseen: Boolean
    roundresults: [RoundResults]
    timer: Int
    questions: [Question]
    replacedquestions: [Question]
  }

  input createSiegeGameInput {
    opponentid: ID!
    category: ID
    timer: Int
  }

  input SiegeResultsInput {
    win: Int
    loss: Int
    tie: Int
    questionsanswered: Int
    correctanswers: Int
    incorrectanswers: Int
  }

  type SiegeEndedPaginationResponse {
    items: [GameSiege]
    hasMore: Boolean
  }

  extend type Query {
    currentsiegegame(id: ID!): GameSiege
    siegegamepage(
      limit: Int!
      offset: Int!
      players: [ID]
      gameover: Boolean
    ): SiegeGamePageResponse
    siegeopponenthistory(
      opponentid: ID!
      limit: Int!
      updatedAt: String
    ): SiegeEndedPaginationResponse
  }

  type SiegeGamePageResponse {
    pages: Int!
    totalrecords: Int!
    siegegames: [GameSiege]
  }

  type NewSiegeGameResponse {
    category: Category
    questions: [Question]
  }

  type GameSiegeError {
    msg: String!
  }

  type SiegeGameSubscriptionResponse {
    playerid: ID!
    updated: Boolean!
  }

  extend type Mutation {
    createsiegegame(input: createSiegeGameInput!): GameSiege
    joinsiegegame(gameid: ID!, timer: Int!): GameSiege
    declinesiegegame(gameid: ID!): GameSiege
    entersiegeanswerandadvance(
      gameid: ID!
      roundresults: RoundResultsInput!
      advance: Boolean!
    ): GameSiege
    siegeresultsseen(gameid: ID!): GameSiege
    expiresiegegame(gameid: ID!): GameSiege
    deletesiegegame(gameid: ID!): GameSiege
  }

  extend type Subscription {
    siegegamesupdate(playerid: ID!): SiegeGameSubscriptionResponse
  }
`;

module.exports = {
  typeDef,
};
