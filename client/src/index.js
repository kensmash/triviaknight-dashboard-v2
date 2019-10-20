import React, { useContext, useReducer, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Routes from "./routes";
//yo apollo
import { ApolloProvider } from "@apollo/react-hooks";
import { client, persistor } from "./apollo";
//context
import GameContext from "./context/context";
import GameReducer from "./context/reducer";
//css
import "semantic-ui-css/semantic.min.css";
import "./index.css";

function App() {
  const initialState = useContext(GameContext);
  const [state, dispatch] = useReducer(GameReducer, initialState);

  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    persistor.restore().then(() => {
      setIsRestored(true);
    });
  }, []);

  return (
    <>
      {!isRestored ? (
        <div>Loading!!!</div>
      ) : (
        <ApolloProvider client={client}>
          <GameContext.Provider value={{ state, dispatch }}>
            <Routes />
          </GameContext.Provider>
        </ApolloProvider>
      )}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
