import gql from "graphql-tag";

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
