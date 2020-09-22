import { gql } from "apollo-boost";

export default gql`
  query announcementQuery($id: ID!) {
    announcement(id: $id) {
      _id
      headline
      text
      published
      createdAt
      updatedAt
    }
  }
`;
