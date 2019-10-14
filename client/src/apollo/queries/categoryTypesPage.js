import gql from "graphql-tag";

export default gql`
  query categoryTypesPage(
    $limit: Int!
    $offset: Int!
    $name: String
    $hasgenres: String
  ) {
    categoryTypesPage(
      limit: $limit
      offset: $offset
      name: $name
      hasgenres: $hasgenres
    ) {
      pages
      totalrecords
      categorytypes {
        _id
        name
        hasgenres
        playable
      }
    }
  }
`;
