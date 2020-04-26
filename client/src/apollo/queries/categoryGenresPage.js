import { gql } from "apollo-boost";

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
        questactive
        nextquestactive
        categorytypes {
          _id
          name
        }
      }
    }
  }
`;
