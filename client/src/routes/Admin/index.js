import React, { Fragment } from "react";
import { Switch, Route } from "react-router-dom";
import Layout from "../../components/Admin/Layout/Layout";
import TopNav from "../../components/Nav/TopNav";
import Dashboard from "./Dashboard/Dashboard";
//categories
import Categories from "./Categories/Categories";
import EditCategory from "./EditCategory/EditCategory";

// when the url matches `/admin` this component renders
class Admin extends React.PureComponent {
  componentWillMount() {
    document.body.style.backgroundColor = "rgba(238, 238, 238, 1)";
  }

  componentWillUnmount() {
    document.body.style.backgroundColor = null;
  }

  render() {
    const { match } = this.props;
    return (
      <Fragment>
        <Route path="/" component={TopNav} />
        <Layout>
          <Switch>
            <Route exact path={match.url + "/"} component={Dashboard} />
            <Route
              exact
              path={match.url + "/categories"}
              component={Categories}
            />

            <Route
              exact
              path={match.url + "/categories/:_id"}
              name="Edit Category"
              component={EditCategory}
            />
          </Switch>
        </Layout>
      </Fragment>
    );
  }
}

export default Admin;
