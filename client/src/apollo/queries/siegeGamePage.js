import { gql } from "apollo-boost";

export default gql`
  query siegeGamePage(
    $limit: Int!
    $offset: Int!
    $players: [ID]
    $gameover: Boolean
  ) {
    siegegamepage(
      limit: $limit
      offset: $offset
      players: $players
      gameover: $gameover
    ) {
      pages
      totalrecords
      siegegames {
        _id
        createdAt
        updatedAt
        topic
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
