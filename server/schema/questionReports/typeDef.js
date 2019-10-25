const { gql } = require("apollo-server-express");

const typeDef = gql`
  type QuestionReport {
    _id: ID
    question: Question!
    reportedby: User!
    message: String!
    questionupdated: Boolean
    createdAt: String
  }

  type QuestionReportsPageResponse {
    pages: Int!
    totalrecords: Int!
    reports: [QuestionReport]
  }

  type QuestionReportsWidgetResponse {
    totalreports: Int!
  }

  extend type Query {
    questionreports: [QuestionReport]
    questionreportswidget: QuestionReportsWidgetResponse
    questionReportsPage(
      limit: Int!
      offset: Int!
      updated: Boolean
    ): QuestionReportsPageResponse
  }

  extend type Mutation {
    createreport(question: ID!, message: String!): QuestionReport
    deletequestionreport(id: ID!): QuestionReport
  }
`;

module.exports = {
  typeDef
};
