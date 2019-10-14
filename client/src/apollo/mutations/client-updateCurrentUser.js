import gql from "graphql-tag";

export default gql`
  mutation updateCurrentUser($loggedin: Boolean, $isAdmin: Boolean) {
    updateCurrentUser(loggedin: $loggedin, isAdmin: $isAdmin) @client {
      loggedin
      isAdmin
    }
  }
`;
