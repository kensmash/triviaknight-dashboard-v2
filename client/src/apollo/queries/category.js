import gql from "graphql-tag";

export default gql`
  query categoryQuery($id: ID!) {
    category(id: $id) {
      _id
      name
      description
      type {
        _id
        hasgenres
        name
      }
      genres {
        _id
        name
      }
      published
      partycategory
      showasnew
      showaspopular
      showasupdated
      joustexclusive
    }
  }
`;
