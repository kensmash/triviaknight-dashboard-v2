import { gql } from "apollo-boost";

export default gql`
  query currentUser {
    currentUser {
      _id
      name
      avatar
      isAdmin
    }
  }
`;
