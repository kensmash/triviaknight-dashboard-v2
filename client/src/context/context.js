import React from "react";

const GameContext = React.createContext({
  isConnected: false,
  homePageLoaded: false
});

export default GameContext;
