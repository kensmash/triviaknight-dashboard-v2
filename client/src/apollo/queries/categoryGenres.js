import { gql } from "apollo-boost";

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
