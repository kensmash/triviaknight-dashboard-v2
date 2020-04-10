const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameQuest {
    _id: ID!
    type: String
    topictype: String
    topic: String
    players: [PlayerPressYourLuck]!
    rounds: Int
    categories: [Category]
    questions: [Question]
    gameover: Boolean
    timedout: Boolean
    createdAt: String
    updatedAt: String
  }

  type PlayerQuest {
    player: User!
    score: Int
    timedout: Boolean
    resultsseen: Boolean
    roundresults: [RoundResults]
  }

  input createQuestGameInput {
    topictype: String!
    topic: String!
    cattype: ID
    category: ID
    genre: ID
  }

  extend type Query {
    currentquesttopic: PressLuckTopicResponse
    currentquestgame(id: ID!): GamePressYourLuck
    questgamepage(
      limit: Int!
      offset: Int!
      player: ID
      gameover: Boolean
    ): QuestGamePageResponse
  }

  type QuestGamePageResponse {
    pages: Int!
    totalrecords: Int!
    questgames: [GameQuest]
  }

  type QuestTopicResponse {
    id: ID
    type: String
    topic: String
  }

  extend type Mutation {
    createquestgame(input: createQuestGameInput!): GameQuest
    enterquestanswer(
      gameid: ID!
      roundresults: RoundResultsInput!
      endgame: Boolean!
    ): GameQuest
    expirequestgame(gameid: ID!): GameQuest
    deletequestame(gameid: ID!): GameQuest
  }
`;

module.exports = {
  typeDef,
};
