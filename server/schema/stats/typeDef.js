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

  type QuestionStats {
    questionsanswered: Int
    correctanswers: Int
    incorrectanswers: Int
    averagescore: Float
    normalquestions: Int!
    normalcorrect: Int!
    hardquestions: Int!
    hardcorrect: Int!
    percentcorrect: Int!
  }

  type SingleCategoryStat {
    _id: ID
    catquestions: Int
    questionsanswered: Int
    questionsansweredpercent: Int
    correct: Int
    incorrect: Int
    percentcorrect: Int
    normalquestions: Int
    normalcorrect: Int
    normalincorrect: Int
    normalpercentcorrect: Int
    hardquestions: Int
    hardcorrect: Int
    hardincorrect: Int
    hardpercentcorrect: Int
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
  }

  type JoustGameStats {
    opponentid: ID
    opponentname: String
    opponentrank: String
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
    opponentrank: String
    opponentavatar: String
    opponentAvatarBackgroundColor: String
    gamesplayed: Int
    wins: Int
    losses: Int
    ties: Int
  }

  type JoustRecordStats {
    gamesplayed: Int
    wins: Int
    losses: Int
    ties: Int
    winpercent: Int
    tiespercent: Int
  }

  type SiegeRecordStats {
    gamesplayed: Int
    wins: Int
    losses: Int
    ties: Int
    winpercent: Int
    tiespercent: Int
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
    questionstats: QuestionStats
    categorystats: [CategoryStats]
    singlecategorystat(catid: ID!): SingleCategoryStat
    categoryrankings(catid: ID!): [CategoryRankings]
    joustgamestats: [JoustGameStats]
    joustrecordstats: JoustRecordStats
    siegegamestats: [SiegeGameStats]
    siegerecordstats: SiegeRecordStats
    questgamestats: [QuestGameStats]
    questlastweekwinners: [QuestPrevWeekWinners]
    questalltimewinners: [QuestAllTimeWinners]
  }
`;

module.exports = {
  typeDef,
};
