import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
//yo apollo
import { ApolloProvider } from "@apollo/react-hooks";
import { client, persistor } from "./apollo";
//css
import "semantic-ui-css/semantic.min.css";
import "./index.css";

function App() {
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    persistor.restore().then(() => setRestored(true));
  }, []);

  return (
    <>
      {restored ? (
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
