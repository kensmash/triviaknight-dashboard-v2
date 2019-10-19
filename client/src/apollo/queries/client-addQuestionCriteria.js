import { gql } from "apollo-boost";

export default gql`
  query addQuestionCriteria {
    addQuestionCriteria @client {
      category
    }
  }
`;
