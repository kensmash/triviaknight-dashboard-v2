import gql from "graphql-tag";

export default gql`
  query addQuestionCriteria {
    addQuestionCriteria @client {
      category
    }
  }
`;
