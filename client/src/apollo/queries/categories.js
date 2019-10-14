import gql from "graphql-tag";

export default gql`
  query categoriesQuery {
    categories {
      _id
      name
      type {
        _id
        name
      }
      genres {
        _id
        name
      }
      published
      partycategory
      joustexclusive
    }
  }
`;
