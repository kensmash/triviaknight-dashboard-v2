import gql from "graphql-tag";

export default gql`
  query pushReceiptsPage($limit: Int!, $offset: Int!, $type: String) {
    pushReceiptsPage(limit: $limit, offset: $offset, type: $type) {
      pages
      totalrecords
      receipts {
        _id
        id
        status
        code
        details {
          error
        }
      }
    }
  }
`;
