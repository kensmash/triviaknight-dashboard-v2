import { gql } from "apollo-boost";

export default gql`
  query categoryGenreQuery($id: ID!) {
    categoryGenre(id: $id) {
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
`;
