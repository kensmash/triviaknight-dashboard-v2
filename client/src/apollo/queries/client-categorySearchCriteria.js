import gql from "graphql-tag";

export default gql`
  query categorySearchCriteria {
    categorySearchCriteria @client {
      activePage
      limit
      name
      type
      genres
      partycategory
    }
  }
`;
