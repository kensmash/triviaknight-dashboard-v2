import React from "react";
import { graphql } from "react-apollo";
import { Route, Redirect } from "react-router";
//query
import currentUserQuery from "../../apollo/queries/currentUser";

class AuthRoute extends React.PureComponent {
  renderRoute = routeProps => {
    const { data, component } = this.props;

    if (!data || data.loading) {
      // loading screen
      return null;
    }

    if (!data.currentUser) {
      // user not logged in
      return <Redirect to="/login" />;
    }

    const Component = component;

    return <Component {...routeProps} />;
  };

  render() {
    const { data, component, ...rest } = this.props;
    return <Route {...rest} render={this.renderRoute} />;
  }
}

export default graphql(currentUserQuery)(AuthRoute);
