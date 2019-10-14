import gql from "graphql-tag";

export default gql`
  query categoryGroupsPage($limit: Int!, $offset: Int!) {
    categoryGroupsPage(limit: $limit, offset: $offset) {
      pages
      totalrecords
      categorygroups {
        _id
        name
        displaytext
        active
        categories {
          _id
          name
        }
      }
    }
  }
`;
