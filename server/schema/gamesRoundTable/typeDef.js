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
    updatedAt: String
  }

  type PlayerRoundTable {
    player: User!
    host: Boolean
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

  input createRoundTableGameInput {
    pointsgoal: Int!
    categoriestype: String!
    categoriesperplayer: Int
    previousquestions: [ID]
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
    currentroundtablegames: [GameRoundTable]
    endedroundtablegames(
      limit: Int!
      endeddate: String
    ): RoundTableEndedPaginationResponse
    currentroundtablegame(id: ID!): GameRoundTable
    currentroundtablegameplayerinfo(id: ID!): GameRoundTable
  }

  extend type Mutation {
    createroundtablegame(input: createRoundTableGameInput!): GameRoundTable
    inviteplayers(
      gameid: ID!
      players: [RoundTablePlayerInput!]
    ): GameRoundTable
    removeplayer(gameid: ID!, playerid: ID!): GameRoundTable
    joinroundtablegame(gameid: ID!): GameRoundTable
    declineroundtablegame(gameid: ID!): GameRoundTable
    addgamecategories(gameid: ID!, categories: [ID!]): GameRoundTable
    startroundtablegame(gameid: ID!, categories: [ID!]): GameRoundTable
    setcurrentroundtablequestion(
      gameid: ID!
      catid: ID!
      previousquestions: [ID]
    ): GameRoundTable
    fetchdifferentroundtablequestion(
      gameid: ID!
      catid: ID!
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
      roundresults: RoundTableRoundResultsInput!
    ): GameRoundTable
    hostenterguess(
      gameid: ID!
      playerid: ID!
      roundresults: RoundTableRoundResultsInput!
    ): GameRoundTable
    hostupdateguess(
      gameid: ID!
      playerid: ID!
      score: Int!
      correct: Boolean!
      roundresults: RoundTableRoundResultsInput!
    ): GameRoundTable
    playerreceiveguessfeedback(gameid: ID!): GameRoundTable
    hostshowanswer(gameid: ID!): GameRoundTable
    gamenextround(
      gameid: ID!
      category: ID!
      tiebreakerround: Int!
    ): GameRoundTable
    setroundtablewinner(gameid: ID!, playerid: ID!): GameRoundTable
    roundtableresultsseen(gameid: ID!): GameRoundTable
    tieroundtablegame(gameid: ID!): GameRoundTable
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
    roundtablegametied(gameid: ID!): GameRoundTable
    roundtablegameover(gameid: ID!): GameRoundTable
    playerremoved(gameid: ID!): GameRoundTable
    roundtablegamecancelled(gameid: ID!): GameRoundTable
  }
`;

module.exports = {
  typeDef,
};