const { gql } = require("apollo-server-express");

const typeDef = gql`
  type GameRoundTable {
    _id: ID!
    title: String
    createdby: User
    categoriestype: String
    categoriestypename: String
    categoriestypeid: ID
    difficulty: String
    players: [PlayerRoundTable]!
    pointsgoal: Int
    categoriesperplayer: Int
    currentround: Int
    gameroundresults: [GameRoundTableRoundResults]
    currentroundhost: ID!
    tiebreakerround: Int
    categories: [Category]
    currentcategory: Category
    savedcategory: Category
    currentquestion: Question
    selectedcategories: [Category]
    selectedquestions: [Question]
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
    leftgame: Boolean
    hasselectedcategories: Boolean
    extrapointsadvantage: Int
    hasskippedhosting: Boolean
    hassavedcategory: Boolean
    categories: [Category]
    answermode: String
    answered: Boolean
    answer: String
    correct: Boolean
    answerrecorded: Boolean
    guessfeedbackreceived: Boolean
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
    correctAnswer: String
    points: Int
  }

  type GameRoundTableRoundResults {
    category: String!
    question: String!
    host: User!
    players: [PlayerRoundTableResult]
  }

  type PlayerRoundTableResult {
    player: User!
    answer: String
    answertype: String
    correct: Boolean
    points: Int
    score: Int
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
    correctAnswer: String
    points: Int
    answertype: String
  }

  input createRoundTableGameInput {
    title: String!
    pointsgoal: Int!
    categoriestype: String!
    categoriesperplayer: Int
    difficulty: String!
    previousquestions: [ID]
  }

  input startRoundTableGameInput {
    gameid: ID!
    categories: [ID]
    categoriestype: String!
    difficulty: String!
    previousquestions: [ID]
    categoriestypeid: [ID]
  }

  input GameRoundResultsInput {
    category: String!
    question: String!
    host: ID!
    players: [GameRoundResultsPlayerInput]!
  }

  input GameRoundResultsPlayerInput {
    player: ID!
    answer: String!
    answertype: String
    correct: Boolean!
    points: Int!
    score: Int!
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

  type RoundTableGameAddedSubscriptionResponse {
    playerids: [ID!]
    gameadded: Boolean!
  }

  extend type Query {
    currentroundtablegames: [GameRoundTable]
    endedroundtablegames(
      limit: Int
      updatedAt: String
    ): RoundTableEndedPaginationResponse
    currentroundtablegame(id: ID!): GameRoundTable
    currentroundtablegameplayerinfo(id: ID!): GameRoundTable
  }

  extend type Mutation {
    createroundtablegame(input: createRoundTableGameInput!): GameRoundTable
    selectcategoriestypeid(
      gameid: ID!
      categoriestypename: String!
      categoriestypeid: ID!
    ): GameRoundTable
    inviteplayers(
      gameid: ID!
      players: [RoundTablePlayerInput!]
    ): GameRoundTable
    removeplayer(gameid: ID!, playerid: ID!): GameRoundTable
    playerleavegame(gameid: ID!): GameRoundTable
    joinroundtablegame(gameid: ID!): GameRoundTable
    declineroundtablegame(gameid: ID!): GameRoundTable
    addgamecategories(gameid: ID!, categories: [ID!]): GameRoundTable
    startroundtablegame(input: startRoundTableGameInput!): GameRoundTable
    fetchdifferentroundtablequestion(
      gameid: ID!
      catid: ID!
      difficulty: String!
      previousquestions: [ID]
    ): GameRoundTable
    questionpointsadvantage(gameid: ID!, points: Int!): GameRoundTable
    stealpointsadvantage(gameid: ID!, leader: ID!): GameRoundTable
    skiphosting(gameid: ID!, nexthostid: ID!): GameRoundTable
    savecategory(
      gameid: ID!
      savedcategory: ID!
      newcategory: ID!
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
    playertimedout(
      gameid: ID!
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
    hostshowquestion(gameid: ID!): GameRoundTable
    hostshowanswer(gameid: ID!): GameRoundTable
    gamenextround(
      gameid: ID!
      category: ID!
      difficulty: String!
      previousquestions: [ID!]
      nexthostid: ID!
      gameroundresults: GameRoundResultsInput!
    ): GameRoundTable
    winroundtablegame(
      gameid: ID!
      playerid: ID!
      gameroundresults: GameRoundResultsInput!
    ): GameRoundTable
    tieroundtableplayer(gameid: ID!, playerid: ID!): GameRoundTable
    tieroundtablegame(
      gameid: ID!
      gameroundresults: GameRoundResultsInput!
    ): GameRoundTable
    roundtableresultsseen(gameid: ID!): GameRoundTable
    expireroundtablegame(gameid: ID!): GameRoundTable
    cancelroundtablegame(gameid: ID!): GameRoundTable
  }

  extend type Subscription {
    usergameadded(playerid: ID!): RoundTableGameAddedSubscriptionResponse
    roundtableplayerjoined(gameid: ID!): GameRoundTable
    roundtabledifferentquestionfetched(gameid: ID!): GameRoundTable
    gamecategoryadded(gameid: ID!): GameRoundTable
    roundtableshowquestion(gameid: ID!): GameRoundTable
    playerselectedcategories(gameid: ID!): GameRoundTable
    roundtablegamestarted(gameid: ID!): GameRoundTable
    roundtablegameupdated(gameid: ID!): GameRoundTable
    roundtableplayerupdated(gameid: ID!): GameRoundTable
    roundtablegameover(gameid: ID!): GameRoundTable
    playerleft(gameid: ID!): GameRoundTable
    playerremoved(gameid: ID!): GameRoundTable
    roundtablegamecancelled(gameid: ID!): GameRoundTable
  }
`;

module.exports = {
  typeDef,
};
