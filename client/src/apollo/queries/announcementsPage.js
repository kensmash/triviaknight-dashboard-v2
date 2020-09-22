import { gql } from "apollo-boost";

export default gql`
  query announcementsPage($limit: Int!, $offset: Int!) {
    announcementsPage(limit: $limit, offset: $offset) {
      pages
      totalrecords
      announcements {
        _id
        headline
        text
        published
        createdAt
        updatedAt
      }
    }
  }
`;
