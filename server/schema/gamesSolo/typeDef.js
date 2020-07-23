const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameSolo {
    _id: ID!
    players: [PlayerSolo]!
    categoriestype: String
    rounds: Int
    timer: Int
    categories: [Category]
    questions: [Question]
    replacedquestions: [Question]
    gameover: Boolean
    timedout: Boolean
    createdAt: String
    updatedAt: String
  }

  type PlayerSolo {
    player: User!
    score: Int!
    answered: Boolean
    resultsseen: Boolean
    roundresults: [RoundResults]
    timer: Int
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

  type PlayerRewards {
    differentquestion: Int
    secondguess: Int
    addtotimer: Int
    removewronganswer: Int
    changehardtoeasy: Int
    addpoints: Int
  }

  input RoundResultsInput {
    question: ID
    difficulty: String
    category: ID
    correct: Boolean
    points: Int
  }

  input ReplaceQuestionInput {
    gameid: ID!
    category: ID!
    questionindex: Int!
    questionid: ID!
    currentquestions: [ID!]
    replacedquestions: [ID]
  }

  extend type Query {
    solotopics: [CategoryType]
    allsologames: [GameSolo]
    solocatsandquestions(type: ID!): NewSoloGameResponse
    currentsologame(id: ID!): GameSolo
  }

  type GameSoloError {
    msg: String!
  }

  type NewSoloGameResponse {
    categories: [Category]
    questions: [Question]
  }

  extend type Mutation {
    createsologame(typeid: ID!, typename: String!, timer: Int): GameSolo
    changesoloquestion(input: ReplaceQuestionInput!): GameSolo
    entersoloanswer(
      gameid: ID!
      roundresults: RoundResultsInput!
      endgame: Boolean!
    ): GameSolo
    savesologame(results: [RoundResultsInput]!): GameSolo
  }
`;

module.exports = {
  typeDef,
};
