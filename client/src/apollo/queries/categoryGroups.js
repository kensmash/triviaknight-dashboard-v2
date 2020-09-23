import { gql } from "apollo-boost";

export default gql`
  {
    categoryGroups {
      _id
      name
      iconname
      displaytext
      active
      categories {
        _id
        name
        published
      }
    }
  }
`;
