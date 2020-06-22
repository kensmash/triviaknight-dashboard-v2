import { gql } from "apollo-boost";

export default gql`
  query categoryQuery($id: ID!) {
    category(id: $id) {
      _id
      name
      description
      iconname
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
      questdescription
      nextquestactive
    }
  }
`;
