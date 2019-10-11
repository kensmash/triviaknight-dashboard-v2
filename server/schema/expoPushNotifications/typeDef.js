const { gql } = require("apollo-server-express");

const typeDef = gql`
  type ExpoPushTicket {
    _id: ID!
    id: String
    type: String
    status: String
    message: String
    details: Details
    receiptid: String
    receiptFetched: Boolean
    code: String
    createdAt: String
  }

  type ExpoPushReceipt {
    _id: ID!
    id: String
    status: String
    message: String
    details: Details
    code: String
    createdAt: String
  }

  type Details {
    error: String
  }

  type PushTicketPageResponse {
    pages: Int!
    totalrecords: Int!
    tickets: [ExpoPushTicket]
  }

  type PushTicketWidgetResponse {
    ticketswitherrors: Int!
  }

  type PushReceiptPageResponse {
    pages: Int!
    totalrecords: Int!
    receipts: [ExpoPushReceipt]
  }

  type PushReceiptWidgetResponse {
    receiptswitherrors: Int!
  }

  extend type Query {
    allPushTickets: [ExpoPushTicket]
    pushticketswidget: PushTicketWidgetResponse
    allPushReceipts: [ExpoPushReceipt]
    pushreceiptswidget: PushReceiptWidgetResponse
    pushTicketsPage(
      limit: Int!
      offset: Int!
      type: String
      receiptFetched: Boolean
    ): PushTicketPageResponse
    pushReceiptsPage(
      limit: Int!
      offset: Int!
      type: String
    ): PushReceiptPageResponse
  }

  extend type Mutation {
    fetchreceipts(ids: [String]!): Boolean
    deletetickets(ids: [String]!): Boolean
    deletereceipts(ids: [String]!): Boolean
    deletepushticket(id: ID!): ExpoPushTicket
    deletepushreceipt(id: ID!): ExpoPushReceipt
  }
`;

module.exports = {
  typeDef
};
