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

  type SingleCategoryStat {
    questionsanswered: Int
    correct: Int
    incorrect: Int
    percentcorrect: Int
    normalquestions: Int
    normalcorrect: Int
    hardquestions: Int
    hardcorrect: Int
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

  type CategoryRankings {
    id: ID
    name: String
    avatar: String
    rank: String
    avatarBackgroundColor: String
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
    opponentAvatarBackgroundColor: String
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
    topic: String
    id: ID
    name: String
    rank: String
    avatar: String
    gamesplayed: Int
    highscore: Int
  }

  type PressLuckPrevWeekWinners {
    topic: String
    id: ID
    name: String
    rank: String
    avatar: String
    highscore: Int
  }

  type PressLuckAllTimeWinners {
    id: ID
    name: String
    rank: String
    avatar: String
    wins: Int
  }

  type QuestGameStats {
    topic: String
    id: ID
    name: String
    rank: String
    avatar: String
    avatarBackgroundColor: String
    gamesplayed: Int
    highscore: Int
  }

  type QuestPrevWeekWinners {
    topic: String
    id: ID
    name: String
    rank: String
    avatar: String
    avatarBackgroundColor: String
    highscore: Int
  }

  type QuestAllTimeWinners {
    id: ID
    name: String
    rank: String
    avatar: String
    avatarBackgroundColor: String
    wins: Int
  }

  extend type Query {
    gamestats: [GameStats]
    categorystats: [CategoryStats]
    singlecategorystat: [SingleCategoryStat]
    categoryrankings(catid: ID!): [CategoryRankings]
    joustgamestats: [JoustGameStats]
    siegegamestats: [SiegeGameStats]
    pressluckgamestats: [PressLuckGameStats]
    presslucklastweekwinners: [PressLuckPrevWeekWinners]
    pressluckalltimewinners: [PressLuckAllTimeWinners]
    questgamestats: [QuestGameStats]
    questlastweekwinners: [QuestPrevWeekWinners]
    questalltimewinners: [QuestAllTimeWinners]
  }
`;

module.exports = {
  typeDef,
};
