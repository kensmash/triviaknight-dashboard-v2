import gql from "graphql-tag";

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
