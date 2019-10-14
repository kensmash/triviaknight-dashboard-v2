import gql from "graphql-tag";

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
