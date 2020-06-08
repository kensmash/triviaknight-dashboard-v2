const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameRoundTable {
    _id: ID!
    createdby: User
    categoriestype: String
    difficulty: String
    players: [PlayerRoundTable]!
    pointsgoal: Int
    categoriesperplayer: Int
    currentround: Int
    currentroundhost: ID!
    tiebreakerround: Int
    categories: [Category]
    currentcategory: Category
    currentquestion: Question
    selectedcategories: [Category]
    selectedquestions: [Question]
    hasquestion: Boolean
    showquestiontoplayers: Boolean
    differentquestionfetchedcount: Int
    showanswertoplayers: Boolean
    started: Boolean
    tied: Boolean
    gameover: Boolean
    cancelled: Boolean
    expired: Boolean
    createdAt: String
  }

  type PlayerRoundTable {
    player: User!
    joined: Boolean
    declined: Boolean
    hasselectedcategories: Boolean
    categories: [Category]
    answermode: String
    answered: Boolean
    answer: String
    correct: Boolean
    answerrecorded: Boolean
    guessfeedbackreceived: Boolean
    alwaysseequestion: Boolean
    score: Int!
    tied: Boolean
    winner: Boolean
    resultsseen: Boolean
    roundresults: [RoundTableRoundResults]
  }

  type RoundTableRoundResults {
    question: Question
    difficulty: String
    category: Category
    answer: String
    answertype: String
    correct: Boolean
    points: Int
  }

  input RoundTablePlayerInput {
    player: ID
    joined: Boolean
    declined: Boolean
    hasselectedcategories: Boolean
    categories: [ID]
    answermode: String
    answered: Boolean
    answerrecorded: Boolean
    answer: String
    score: Int
  }

  input RoundTableRoundResultsInput {
    round: Int
    question: ID
    difficulty: String
    category: ID
    answer: String
    correct: Boolean
    points: Int
    answertype: String
  }

  type QuestionSelectedSubscriptionResponse {
    gameid: ID!
    questionselected: Boolean
  }

  type GuessSubscriptionResponse {
    gameid: ID!
    playerid: ID!
    correct: Boolean
  }

  type RoundTableEndedPaginationResponse {
    items: [GameRoundTable]
    hasMore: Boolean
  }

  extend type Query {
    allroundtablegames: [GameRoundTable]
    allendedroundtablegames(
      limit: Int!
      endeddate: String
    ): RoundTableEndedPaginationResponse
    currentroundtablegame(id: ID!): GameRoundTable
    currentroundtablegameplayerinfo(id: ID!): GameRoundTable
  }

  extend type Mutation {
    createroundtablegame(
      pointsgoal: Int!
      categoriestype: String!
      categoriesperplayer: Int
      previousquestions: [ID]
      categories: [ID]
    ): GameRoundTable
    inviteplayers(
      gameid: ID!
      players: [RoundTablePlayerInput!]
      playerExpoPushTokens: [String]
    ): GameRoundTable
    removeplayer(gameid: ID!, playerid: ID!): GameRoundTable
    joinroundtablegame(gameid: ID!): GameRoundTable
    declineroundtablegame(gameid: ID!): GameRoundTable
    addgamecategories(gameid: ID!, categories: [ID!]): GameRoundTable
    startroundtablegame(
      gameid: ID!
      categories: [ID!]
      playerExpoPushTokens: [String]!
    ): GameRoundTable
    setcurrentroundtablequestion(
      gameid: ID!
      category: ID!
      previousquestions: [ID]
    ): GameRoundTable
    fetchdifferentroundtablequestion(
      gameid: ID!
      category: ID!
      previousquestions: [ID]
    ): GameRoundTable
    setplayeranswermode(gameid: ID!, answermode: String!): GameRoundTable
    resetplayerresponse(gameid: ID!, playerid: ID!): GameRoundTable
    removeplayerroundresults(
      gameid: ID!
      playerid: ID!
      score: Int!
    ): GameRoundTable
    playerenterguess(gameid: ID!, guess: String!): GameRoundTable
    playerentermultchoice(
      gameid: ID!
      answer: String!
      roundresults: RoundResultsInput!
    ): GameRoundTable
    hostenterguess(
      gameid: ID!
      playerid: ID!
      roundresults: RoundResultsInput!
    ): GameRoundTable
    hostupdateguess(
      gameid: ID!
      playerid: ID!
      score: Int!
      correct: Boolean!
      roundresults: RoundResultsInput!
    ): GameRoundTable
    playerreceiveguessfeedback(gameid: ID!): GameRoundTable
    hostshowquestion(gameid: ID!): GameRoundTable
    hostshowanswer(gameid: ID!): GameRoundTable
    playernextround(gameid: ID!, playerid: ID!): GameRoundTable
    gamenextround(
      gameid: ID!
      category: ID!
      tiebreakerround: Int!
    ): GameRoundTable
    setroundtabletie(gameid: ID!, playerid: ID!): GameRoundTable
    removeroundtabletie(gameid: ID!, playerid: ID!): GameRoundTable
    setroundtablewinner(gameid: ID!, playerid: ID!): GameRoundTable
    roundtableresultsseen(gameid: ID!): GameRoundTable
    tieroundtablegame(gameid: ID!): GameRoundTable
    starttiebreakerrounds(gameid: ID!): GameRoundTable
    endroundtablegame(gameid: ID!): GameRoundTable
    expireroundtablegame(gameid: ID!): GameRoundTable
    cancelroundtablegame(gameid: ID!): GameRoundTable
  }

  extend type Subscription {
    roundtableplayerjoined(gameid: ID!): GameRoundTable
    gamecategoryadded(gameid: ID!): GameRoundTable
    playerselectedcategories(gameid: ID!): GameRoundTable
    roundtablegamestarted(gameid: ID!): GameRoundTable
    roundtablegameupdated(gameid: ID!): GameRoundTable
    roundtableplayerupdated(gameid: ID!): GameRoundTable
    hostshowquestion(gameid: ID!): GameRoundTable
    roundtablegametied(gameid: ID!): GameRoundTable
    roundtablegameover(gameid: ID!): GameRoundTable
    playerremoved(gameid: ID!): GameRoundTable
    roundtablegamecancelled(gameid: ID!): GameRoundTable
  }
`;

module.exports = {
  typeDef,
};
