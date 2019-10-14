import gql from "graphql-tag";

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
