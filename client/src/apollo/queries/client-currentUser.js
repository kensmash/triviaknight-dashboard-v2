import { gql } from "apollo-boost";

export default gql`
  query currentUser {
    currentUser @client {
      loggedin
      isAdmin
    }
  }
`;
