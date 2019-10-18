import { gql } from "apollo-boost";

export default gql`
  query supportRequestQuery($id: ID!) {
    supportrequest(id: $id) {
      _id
      replysent
      resolved
      from
      text
      subject
      createdAt
    }
  }
`;
