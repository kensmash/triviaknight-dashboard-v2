import { gql } from "apollo-boost";

export default gql`
  query categoryTypeQuery($id: ID!) {
    categoryType(id: $id) {
      _id
      name
      iconname
      iconset
      hasgenres
      playable
    }
  }
`;
