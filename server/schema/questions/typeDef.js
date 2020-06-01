const { gql } = require("apollo-server-express");

const typeDef = gql`
  type Question {
    _id: ID
    createdAt: String
    question: String
    answers: [Answer]
    category: Category
    type: String
    difficulty: String
    imageurl: String
    videourl: String
    audiourl: String
    published: Boolean
    guessable: Boolean
  }

  type Answer {
    answer: String!
    correct: Boolean!
  }

  input AnswersInput {
    answer: String!
    correct: Boolean!
  }

  type QuestionPageResponse {
    pages: Int!
    totalrecords: Int!
    questions: [Question]
  }

  type QuestionWidgetResponse {
    totalquestions: Int!
    unpublishedquestions: Int!
  }

  input upsertQuestionInput {
    id: ID
    question: String!
    answers: [AnswersInput]!
    category: ID!
    type: ID!
    difficulty: ID!
    imageurl: String
    videourl: String
    audiourl: String
    published: Boolean!
    guessable: Boolean!
  }

  extend type Query {
    question(id: ID!): Question
    questionswidget: QuestionWidgetResponse
    questionspage(
      limit: Int!
      offset: Int!
      question: String
      category: ID
      difficulty: String
      type: String
      published: Boolean
    ): QuestionPageResponse
  }

  extend type Mutation {
    upsertquestion(input: upsertQuestionInput): Question
    deletequestion(id: ID!): Question
  }
`;

module.exports = {
  typeDef,
};
