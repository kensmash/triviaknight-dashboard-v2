import { gql } from "apollo-boost";

export default gql`
  query categoryGenreSearchCriteria {
    categoryGenreSearchCriteria @client {
      activePage
      limit
      name
      types
    }
  }
`;
