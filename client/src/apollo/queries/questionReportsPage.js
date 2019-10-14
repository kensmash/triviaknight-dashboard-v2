import gql from "graphql-tag";

export default gql`
  query questionReportsPage($limit: Int!, $offset: Int!, $updated: Boolean) {
    questionReportsPage(limit: $limit, offset: $offset, updated: $updated) {
      pages
      totalrecords
      reports {
        _id
        question {
          _id
          question
        }
        createdAt
        message
        questionupdated
      }
    }
  }
`;
