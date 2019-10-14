import gql from "graphql-tag";

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
