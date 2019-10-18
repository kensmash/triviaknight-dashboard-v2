import { gql } from "apollo-boost";

export default gql`
  query categoryGroupQuery($id: ID!) {
    categoryGroup(id: $id) {
      _id
      name
      displaytext
      active
      categories {
        _id
        name
      }
    }
  }
`;
