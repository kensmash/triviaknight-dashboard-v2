import { gql } from "apollo-boost";

export default gql`
  query questionSearchCriteria {
    questionSearchCriteria @client {
      activePage
      limit
      question
      category
      difficulty
      type
      publishedstatus
    }
  }
`;
