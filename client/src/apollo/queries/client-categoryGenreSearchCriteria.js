import gql from "graphql-tag";

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
