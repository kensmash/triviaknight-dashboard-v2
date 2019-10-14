import React from "react";
import { ApolloConsumer } from "react-apollo";
import { Redirect } from "react-router-dom";

const Logout = () => (
  <ApolloConsumer>
    {client => {
      client.resetStore();
      return <Redirect to="/login" />;
    }}
  </ApolloConsumer>
);

export default Logout;
