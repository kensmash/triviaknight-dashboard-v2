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

  extend type Query {
    announcement: Announcement
    announcements: [Announcement]
    announcementspage: [Announcement]
  }

  input upsertAnnouncementInput {
    id: ID
    headline: String!
    text: String!
    imageurl: String
  }

  extend type Mutation {
    upsertannouncement(input: upsertAnnouncementInput): Announcement
    deleteannouncement(id: ID!): Announcement
  }
`;

module.exports = {
  typeDef,
};
