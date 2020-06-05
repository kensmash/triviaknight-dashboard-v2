const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameHosted {
    _id: ID!
    createdby: User
    categoriestype: String
    difficulty: String
    players: [PlayerHosted]!
    pointsgoal: Int
    categoriesperplayer: Int
    currentround: Int
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

  type PlayerHosted {
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
    roundresults: [HostedRoundResults]
  }

  type HostedRoundResults {
    question: Question
    difficulty: String
    category: Category
    answer: String
    answertype: String
    correct: Boolean
    points: Int
  }

  input HostedPlayerInput {
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

  input HostedRoundResultsInput {
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

  type HostedHostEndedPaginationResponse {
    items: [GameHosted]
    hasMore: Boolean
  }

  type HostedPlayerEndedPaginationResponse {
    items: [GameHosted]
    hasMore: Boolean
  }

  extend type Query {
    allhostedgames: [GameHosted]
    allendedhostedhostgames(
      limit: Int!
      endeddate: String
    ): HostedHostEndedPaginationResponse
    allendedhostedplayergames(
      limit: Int!
      endeddate: String
    ): HostedPlayerEndedPaginationResponse
    currenthostedgame(id: ID!): GameHosted
    currenthostedgameplayerinfo(id: ID!): GameHosted
  }

  extend type Mutation {
    createhostedgame(
      pointsgoal: Int!
      categoriestype: String!
      categoriesperplayer: Int
      previousquestions: [ID]
      categories: [ID]
    ): GameHosted
    inviteplayers(
      gameid: ID!
      players: [HostedPlayerInput!]
      playerExpoPushTokens: [String]
    ): GameHosted
    removeplayer(gameid: ID!, playerid: ID!): GameHosted
    joinhostedgame(gameid: ID!): GameHosted
    declinehostedgame(gameid: ID!): GameHosted
    addgamecategories(gameid: ID!, categories: [ID!]): GameHosted
    hostedplayeralwaysseequestion(gameid: ID!): GameHosted
    starthostedgame(
      gameid: ID!
      categories: [ID!]
      playerExpoPushTokens: [String]!
    ): GameHosted
    setcurrenthostedquestion(
      gameid: ID!
      category: ID!
      previousquestions: [ID]
    ): GameHosted
    fetchdifferenthostedquestion(
      gameid: ID!
      category: ID!
      previousquestions: [ID]
    ): GameHosted
    setplayeranswermode(gameid: ID!, answermode: String!): GameHosted
    resetplayerresponse(gameid: ID!, playerid: ID!): GameHosted
    removeplayerroundresults(
      gameid: ID!
      playerid: ID!
      score: Int!
    ): GameHosted
    playerenterguess(gameid: ID!, guess: String!): GameHosted
    playerentermultchoice(
      gameid: ID!
      answer: String!
      roundresults: RoundResultsInput!
    ): GameHosted
    hostenterguess(
      gameid: ID!
      playerid: ID!
      roundresults: RoundResultsInput!
    ): GameHosted
    hostupdateguess(
      gameid: ID!
      playerid: ID!
      score: Int!
      correct: Boolean!
      roundresults: RoundResultsInput!
    ): GameHosted
    playerreceiveguessfeedback(gameid: ID!): GameHosted
    hostshowquestion(gameid: ID!): GameHosted
    hostshowanswer(gameid: ID!): GameHosted
    playernextround(gameid: ID!, playerid: ID!): GameHosted
    gamenextround(gameid: ID!, category: ID!, tiebreakerround: Int!): GameHosted
    sethostedtie(gameid: ID!, playerid: ID!): GameHosted
    removehostedtie(gameid: ID!, playerid: ID!): GameHosted
    sethostedwinner(gameid: ID!, playerid: ID!): GameHosted
    hostedresultsseen(gameid: ID!): GameHosted
    tiehostedgame(gameid: ID!): GameHosted
    starttiebreakerrounds(gameid: ID!): GameHosted
    endhostedgame(gameid: ID!): GameHosted
    expirehostedgame(gameid: ID!): GameHosted
    cancelhostedgame(gameid: ID!): GameHosted
  }

  extend type Subscription {
    hostedplayerjoined(gameid: ID!): GameHosted
    gamecategoryadded(gameid: ID!): GameHosted
    playerselectedcategories(gameid: ID!): GameHosted
    hostedgamestarted(gameid: ID!): GameHosted
    hostedgameupdated(gameid: ID!): GameHosted
    hostedplayerupdated(gameid: ID!): GameHosted
    hostshowquestion(gameid: ID!): GameHosted
    hostedgametied(gameid: ID!): GameHosted
    hostedgameover(gameid: ID!): GameHosted
    playerremoved(gameid: ID!): GameHosted
    hostedgamecancelled(gameid: ID!): GameHosted
  }
`;

module.exports = {
  typeDef,
};
