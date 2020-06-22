const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameQuest {
    _id: ID!
    type: String
    topictype: String
    topic: String
    players: [PlayerQuest]!
    rounds: Int
    categories: [Category]
    questions: [Question]
    replacedquestions: [Question]
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
    timer: Int
    gems: Int
  }

  input createQuestGameInput {
    timer: Int
    topictype: String!
    topic: String!
    cattype: ID
    category: ID
    genre: ID
  }

  extend type Query {
    currentquesttopic: QuestTopicResponse
    nextquesttopic: QuestTopicResponse
    currentquestgame(id: ID!): GameQuest
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
    description: String
  }

  extend type Mutation {
    createquestgame(input: createQuestGameInput!): GameQuest
    changequestquestion(input: ReplaceQuestionInput!): GameQuest
    enterquestanswer(
      gameid: ID!
      roundresults: RoundResultsInput!
      endgame: Boolean!
    ): GameQuest
    expirequestgame(gameid: ID!): GameQuest
    deletequestgame(gameid: ID!): GameQuest
  }

  extend type Subscription {
    questtopicupdated: QuestTopicResponse
  }
`;

module.exports = {
  typeDef,
};
