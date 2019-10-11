const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameStats {
    type: String
    questionsanswered: Int
    correctanswers: Int
    incorrectanswers: Int
    averagescore: Float
    normalquestions: Int!
    normalcorrect: Int!
    hardquestions: Int!
    hardcorrect: Int!
  }

  type CategoryStats {
    categoryid: ID
    categoryname: String
    categorytypeicon: String
    questionsanswered: Int
    correct: Int
    incorrect: Int
    percentcorrect: Int
    normalquestions: Int
    normalcorrect: Int
    hardquestions: Int
    hardcorrect: Int
  }

  type JoustGameStats {
    opponentid: ID
    opponentname: String
    opponentavatar: String
    gamesplayed: Int
    wins: Int
    losses: Int
    ties: Int
  }

  type SiegeGameStats {
    opponentid: ID
    opponentname: String
    opponentavatar: String
    gamesplayed: Int
    wins: Int
    losses: Int
    ties: Int
  }

  type PressLuckGameStats {
    genre: String
    id: ID
    name: String
    rank: String
    avatar: String
    string: String
    gamesplayed: Int
    highscore: Int
  }

  extend type Query {
    gamestats: [GameStats]
    categorystats: [CategoryStats]
    joustgamestats: [JoustGameStats]
    siegegamestats: [SiegeGameStats]
    pressluckgamestats: [PressLuckGameStats]
  }
`;

module.exports = {
  typeDef
};
