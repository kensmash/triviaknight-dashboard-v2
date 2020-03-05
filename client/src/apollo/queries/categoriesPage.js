import { gql } from "apollo-boost";

export default gql`
  query categoriesPage($input: categoryPageInput) {
    categoriespage(input: $input) {
      pages
      totalrecords
      categories {
        _id
        name
        description
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
        showasnew
        showaspopular
        joustexclusive
        pressluckactive
        questions {
          _id
          difficulty
        }
      }
    }
  }
`;
