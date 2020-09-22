const { gql } = require("apollo-server-express");

const typeDef = gql`
  type Announcement {
    _id: ID
    headline: String
    text: String
    published: Boolean
    imageurl: String
    createdAt: String
    updatedAt: String
  }

  input upsertAnnouncementInput {
    id: ID
    headline: String!
    text: String!
    imageurl: String
  }

  type AnnouncementWidgetResponse {
    totalannouncements: Int!
    unpublishedannouncements: Int!
  }

  type AnnouncementPageResponse {
    pages: Int!
    totalrecords: Int!
    announcements: [Announcement]
  }

  extend type Query {
    announcement: Announcement
    announcements: [Announcement]
    announcementsPage: [AnnouncementPageResponse]
    announcementsWidget: AnnouncementWidgetResponse
  }

  extend type Mutation {
    upsertannouncement(input: upsertAnnouncementInput): Announcement
    deleteannouncement(id: ID!): Announcement
  }
`;

module.exports = {
  typeDef,
};
