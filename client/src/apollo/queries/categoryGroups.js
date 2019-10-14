import gql from "graphql-tag";

export default gql`
  {
    categoryGroups {
      _id
      name
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
