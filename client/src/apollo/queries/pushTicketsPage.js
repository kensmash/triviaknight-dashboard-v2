import { gql } from "apollo-boost";

export default gql`
  query pushTicketsPage(
    $limit: Int!
    $offset: Int!
    $type: String
    $receiptFetched: Boolean
  ) {
    pushTicketsPage(
      limit: $limit
      offset: $offset
      type: $type
      receiptFetched: $receiptFetched
    ) {
      pages
      totalrecords
      tickets {
        _id
        id
        type
        status
        receiptFetched
        code
        details {
          error
        }
        createdAt
      }
    }
  }
`;
