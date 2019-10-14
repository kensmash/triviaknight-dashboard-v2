import gql from "graphql-tag";

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
