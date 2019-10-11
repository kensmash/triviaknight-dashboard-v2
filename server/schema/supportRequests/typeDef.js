const { gql } = require("apollo-server-express");

const typeDef = gql`
  type SupportRequest {
    _id: ID!
    from: String
    subject: String
    text: String
    replysent: Boolean
    resolved: Boolean
    createdAt: String
  }

  type SupportRequestPageResponse {
    pages: Int!
    totalrecords: Int!
    requests: [SupportRequest]
  }

  type SupportRequestWidgetResponse {
    openrequests: Int!
    newrequests: Int!
  }

  extend type Query {
    supportrequest(id: ID!): SupportRequest
    allSupportRequests: [SupportRequest]
    supportrequestswidget: SupportRequestWidgetResponse
    supportRequestPage(
      limit: Int!
      offset: Int!
      replysent: Boolean
      resolved: Boolean
    ): SupportRequestPageResponse
  }

  extend type Mutation {
    sendreply(
      id: ID!
      to: String!
      subject: String!
      reply: String
    ): SupportRequest
    markresolved(id: ID!): SupportRequest
    deleterequest(id: ID!): SupportRequest
  }
`;

module.exports = {
  typeDef
};
