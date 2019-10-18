import { gql } from "apollo-boost";

export default gql`
  query questionsPage(
    $limit: Int!
    $offset: Int!
    $question: String
    $category: ID
    $difficulty: String
    $type: String
    $published: Boolean
  ) {
    questionspage(
      limit: $limit
      offset: $offset
      question: $question
      category: $category
      difficulty: $difficulty
      type: $type
      published: $published
    ) {
      pages
      totalrecords
      questions {
        createdAt
        _id
        question
        answers {
          answer
          correct
        }
        category {
          _id
          name
        }
        type
        difficulty
        published
      }
    }
  }
`;
