import gql from "graphql-tag";

export default gql`
  query categoryGenresPage(
    $limit: Int!
    $offset: Int!
    $name: String
    $categorytypes: [ID]
  ) {
    categoryGenresPage(
      limit: $limit
      offset: $offset
      name: $name
      categorytypes: $categorytypes
    ) {
      pages
      totalrecords
      categorygenres {
        _id
        name
        playable
        pressluckactive
        categorytypes {
          _id
          name
        }
      }
    }
  }
`;
