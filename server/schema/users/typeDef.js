const { gql } = require("apollo-server-express");

const typeDef = gql`
  type User {
    _id: ID!
    createdAt: String
    updatedAt: String
    lastActiveAt: String
    name: String
    email: String
    access: String
    hasCompletedSignUpFlow: Boolean
    hasSeenPushNotificationOptions: Boolean
    hasSeenAnnouncements: Boolean
    questionsAnswered: Int
    isAdmin: Boolean
    rank: String
    avatar: String
    avatarBackgroundColor: String
    categories: [Category]
    friends: [User]
    blockedusers: [User]
    sologames: [GameSolo]
    joustgames: [GameJoust]
    questgames: [GameQuest]
    expoPushTokens: [String]
    gems: Int
    streak: Int
    preferences: UserPreferences
  }

  type UserPreferences {
    showonleaderboards: Boolean
    acceptsgamepushnotifications: Boolean
    acceptsweeklypushnotifications: Boolean
    playsounds: Boolean
    playpartysounds: Boolean
    allowvibrations: Boolean
    allowpartyvibrations: Boolean
  }

  type UserPageResponse {
    pages: Int!
    totalrecords: Int!
    users: [User]
  }

  type UserGamesResponse {
    currentsologames: [GameSolo]
    joustgames: [GameJoust]
    siegegames: [GameSiege]
    recentquestgames: [GameQuest]
    roundtablegames: [GameRoundTable]
  }

  type UserNameSearchResponse {
    items: [User]
    hasMore: Boolean
  }

  type UserWidgetResponse {
    totalusers: Int!
    newusers: Int!
  }

  type GameChallengesResponse {
    joustgames: [GameJoust]
  }

  type JoustSevenDayLeaderBoardResponse {
    joustsevendayid: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    wins: Int!
    ties: Int
  }

  type JoustLeaderBoardResponse {
    joustid: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    wins: Int!
    ties: Int
  }

  type SiegeSevenDayLeaderBoardResponse {
    id: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    wins: Int!
    ties: Int
  }

  type SiegeLeaderBoardResponse {
    id: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    wins: Int!
    ties: Int
  }

  type QuestSevenDayLeaderBoardResponse {
    id: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    highscore: Int
  }

  type PlayerProfileReponse {
    id: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    createdAt: String!
    favoritecategories: [Category]
    questionsanswered: Int
    correct: Int
    incorrect: Int
    percentcorrect: Int
    joustwins: Int
    joustlosses: Int
    joustties: Int
    winpercent: Int
    tiespercent: Int
    siegewins: Int
    siegelosses: Int
    siegeties: Int
    siegewinpercent: Int
    siegetiespercent: Int
  }

  extend type Query {
    currentUser: User
    userwidget: UserWidgetResponse
    playerprofile(id: ID!): PlayerProfileReponse!
    gameOpponent(id: ID!): User
    randomOpponent: User
    userGames: UserGamesResponse
    currentsologames: [GameSolo]
    joustgames: [GameJoust]
    recentquestgames: [GameQuest]
    joustleaderssevendays: [JoustSevenDayLeaderBoardResponse]
    joustleaders: [JoustLeaderBoardResponse]
    siegeleaderssevendays: [SiegeSevenDayLeaderBoardResponse]
    siegeleaders: [SiegeLeaderBoardResponse]
    questleaderssevendays: [QuestSevenDayLeaderBoardResponse]
    allusers: [User]!
    questionsanswered: Int!
    challengeusers: [User]!
    username(
      name: String
      access: String!
      limit: Int!
      updatedAt: String
    ): UserNameSearchResponse
    userspage(offset: Int!, limit: Int!, name: String): UserPageResponse
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    access: String!
    expoPushToken: String
  }

  type UserGameSubscriptionResponse {
    playerid: ID!
    updated: Boolean!
  }

  extend type Mutation {
    signup(userinput: SignupInput!): AuthPayload!
    login(
      email: String!
      password: String!
      access: String!
      expoPushToken: String
    ): LoginResponse!
    logout: LogoutResponse!
    avatar(avatar: String!): User
    addusercategory(catid: ID!): User
    removeusercategory(catid: ID!): User
    adduserfriend(playerid: ID!): User
    adduserfriends(playerids: [ID]!): User
    removeuserfriend(playerid: ID!): User
    addexpopushtoken(token: String!): User
    replaceexpopushtoken(newtoken: String!, previoustoken: String!): User
    sendforgotpasswordemail(email: String!): Boolean
    resetpasswordcode(email: String!, code: Int!): Boolean
    updatepassword(email: String!, password: String!): Boolean
    updateusername(name: String!): UserNameChangeResponse
    updateavatarandcolor(avatar: String!, color: String!): User
    buyreward(reward: String!, amount: Int!): User
    changegems(add: Boolean!, amount: Int!): User
    updatesignupflow: User
    completesignupflow: User
    updateannouncementsseen: User
    pushnotificationoptionseen(acceptsnotifications: Boolean!): User
    changeemail(email: String!): User
    updaterank(rank: String!): User
    blockuser(playerid: ID!): User
    updateleaderboardpreference(preference: Boolean!): User
    updatesoundpreference(preference: Boolean!): User
    updatevibrationpreference(preference: Boolean!): User
    updategamepushpreference(preference: Boolean!): User
    updateweeklypushpreference(preference: Boolean!): User
  }

  extend type Subscription {
    usergamesupdate(playerid: ID!): UserGameSubscriptionResponse
  }

  type Error {
    field: String!
    msg: String!
  }

  type LoginResponse {
    payload: AuthPayload
    error: Error
  }

  type LogoutResponse {
    success: Boolean
    error: Error
  }

  type UserNameChangeResponse {
    user: User
    error: Error
  }

  type AuthPayload {
    sessionID: String
    user: User
    error: Error
  }
`;

module.exports = {
  typeDef,
};
