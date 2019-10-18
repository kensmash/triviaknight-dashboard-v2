import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Routes from "./routes";
//yo apollo
import { ApolloProvider } from "@apollo/react-hooks";
import { client, persistor } from "./apollo";
//css
import "semantic-ui-css/semantic.min.css";
import "./index.css";

function App() {
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
          <Routes />
        </ApolloProvider>
      )}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
