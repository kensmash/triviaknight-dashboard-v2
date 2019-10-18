import { gql } from "apollo-boost";

export default gql`
  {
    categoryTypes {
      _id
      name
      hasgenres
      playable
    }
  }
`;
