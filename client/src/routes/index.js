import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from "./Home/Home";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy";
import Login from "./Login/Login";
import Logout from "./Logout/Logout";
import AuthRoute from "./RouteComponents/AuthRoute";
import AdminRoute from "./RouteComponents/AdminRoute";

import Auth from "./Auth";
import Admin from "./Admin";

export default () => (
  <BrowserRouter>
    <>
      <Route exact path="/" component={Home} />
      <Route exact path="/privacypolicy" component={PrivacyPolicy} />
      <Route exact path="/login" render={props => <Login {...props} />} />
      <Route exact path="/logout" render={props => <Logout {...props} />} />
      <AuthRoute path="/auth" component={Auth} />
      <AdminRoute path="/admin" component={Admin} />
    </>
  </BrowserRouter>
);
