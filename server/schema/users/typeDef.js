const { gql } = require("apollo-server-express");

const typeDef = gql`
  type User {
    _id: ID!
    createdAt: String
    updatedAt: String
    name: String
    email: String
    hasCompletedSignUpFlow: Boolean
    isAdmin: Boolean
    rank: String
    avatar: String
    avatarBackgroundColor: String
    categories: [Category]
    friends: [User]
    blockedusers: [User]
    sologames: [GameSolo]
    joustgames: [GameJoust]
    siegegames: [GameSiege]
    pressluckgames: [GamePressYourLuck]
    questgames: [GameQuest]
    expoPushTokens: [String]
    gems: Int
  }

  type UserPageResponse {
    pages: Int!
    totalrecords: Int!
    users: [User]
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
    siegegames: [GameSiege]
  }

  type JoustLeaderBoardResponse {
    joustid: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    wins: Int!
  }

  type SiegeLeaderBoardResponse {
    siegeid: ID!
    name: String!
    rank: String!
    avatar: String!
    gamesplayed: Int!
    wins: Int!
  }

  type JoustSevenDayLeaderBoardResponse {
    joustsevendayid: ID!
    name: String!
    rank: String!
    avatar: String!
    avatarBackgroundColor: String!
    gamesplayed: Int!
    wins: Int!
  }

  type SiegeSevenDayLeaderBoardResponse {
    siegesevendayid: ID!
    name: String!
    rank: String!
    avatar: String!
    gamesplayed: Int!
    wins: Int!
  }

  type PressLuckSevenDayLeaderBoardResponse {
    id: ID!
    name: String!
    rank: String!
    avatar: String!
    gamesplayed: Int!
    highscore: Int
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

  extend type Query {
    currentUser: User
    userwidget: UserWidgetResponse
    gameOpponent(id: ID!): User
    randomOpponent: User
    userGames: User
    currentsologames: [GameSolo]
    joustgames: [GameJoust]
    recentpressluckgames: [GamePressYourLuck]
    recentquestgames: [GameQuest]
    joustleaders: [JoustLeaderBoardResponse]
    joustleaderssevendays: [JoustSevenDayLeaderBoardResponse]
    siegeleaders: [SiegeLeaderBoardResponse]
    siegeleaderssevendays: [SiegeSevenDayLeaderBoardResponse]
    pressluckleaderssevendays: [PressLuckSevenDayLeaderBoardResponse]
    questleaderssevendays: [QuestSevenDayLeaderBoardResponse]
    allusergames: UserGameResponse
    alluserpartygames: UserPartyGameResponse
    allusers: [User]!
    challengeusers: [User]!
    username(name: String, cursor: ID): UserNameSearchResponse
    userspage(offset: Int!, limit: Int!, name: String): UserPageResponse
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    expoPushToken: String
  }

  extend type Mutation {
    signup(userinput: SignupInput!): AuthPayload!
    login(
      email: String!
      password: String!
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
    sendforgotpasswordemail(email: String!): Boolean
    resetpasswordcode(email: String!, code: Int!): Boolean
    updatepassword(email: String!, password: String!): Boolean
    updateusername(name: String!): UserNameChangeResponse
    updateavatarandcolor(avatar: String!, color: String!): User
    buyreward(reward: String!, amount: Int!): User
    changegems(add: Boolean!, amount: Int!): User
    updatesignupflow: User
    changeemail(email: String!): User
    changerank: Boolean
    blockuser(playerid: ID!): User
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

  type UserGameResponse {
    pressluckgames: [GamePressYourLuck]
    joustgames: [GameJoust]
    siegegames: [GameSiege]
  }

  type UserPartyGameResponse {
    hostedgameshost: [GameHosted]
    hostedgamesplayer: [GameHosted]
  }
`;

module.exports = {
  typeDef,
};
