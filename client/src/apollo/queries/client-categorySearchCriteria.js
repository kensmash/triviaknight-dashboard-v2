import { gql } from "apollo-boost";

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
