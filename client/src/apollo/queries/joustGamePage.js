import gql from "graphql-tag";

export default gql`
  query joustGamePage(
    $limit: Int!
    $offset: Int!
    $players: [ID]
    $gameover: Boolean
  ) {
    joustgamepage(
      limit: $limit
      offset: $offset
      players: $players
      gameover: $gameover
    ) {
      pages
      totalrecords
      joustgames {
        _id
        createdAt
        updatedAt
        category {
          _id
          name
        }
        gameover
        players {
          player {
            _id
            name
          }
          joined
        }
      }
    }
  }
`;
