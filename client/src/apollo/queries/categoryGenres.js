import gql from "graphql-tag";

export default gql`
  {
    categoryGenres {
      _id
      name
      playable
      categorytypes {
        _id
      }
    }
  }
`;
