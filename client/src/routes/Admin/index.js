import React, { Fragment } from "react";
import { Switch, Route } from "react-router-dom";
import Layout from "../../components/Admin/Layout/Layout";
import TopNav from "../../components/TopNav/TopNav";
//Dashboard
import Dashboard from "./Dashboard/Dashboard";
//categories
import Categories from "./Categories/Categories";
import EditCategory from "./EditCategory/EditCategory";
import CategoryTypes from "./CategoryTypes/CategoryTypes";
import EditCategoryType from "./EditCategoryType/EditCategoryType";
import CategoryGenres from "./CategoryGenres/CategoryGenres";
import EditCategoryGenre from "./EditCategoryGenre/EditCategoryGenre";
import CategoryGroups from "./CategoryGroups/CategoryGroups";
import EditCategoryGroup from "./EditCategoryGroup/EditCategoryGroup";
//questions
import Questions from "./Questions/Questions";
import NewQuestion from "./NewQuestion/NewQuestion";
import EditQuestion from "./EditQuestion/EditQuestion";

// when the url matches `/admin` this component renders
class Admin extends React.PureComponent {
  componentDidMount() {
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
            <Route
              exact
              path={match.url + "/categorytypes"}
              component={CategoryTypes}
            />
            <Route
              exact
              path={match.url + "/categorytypes/:_id"}
              name="Edit Category Type"
              component={EditCategoryType}
            />
            <Route
              exact
              path={match.url + "/categorygenres"}
              component={CategoryGenres}
            />
            <Route
              exact
              path={match.url + "/categorygenres/:_id"}
              name="Edit Category Genre"
              component={EditCategoryGenre}
            />
            <Route
              exact
              path={match.url + "/categorygroups"}
              component={CategoryGroups}
            />
            <Route
              exact
              path={match.url + "/categorygroups/:_id"}
              name="Edit Category Group"
              component={EditCategoryGroup}
            />
            <Route
              exact
              path={match.url + "/questions"}
              component={Questions}
            />
            <Route
              exact
              path={match.url + "/questions/new"}
              name="New Question"
              component={NewQuestion}
            />
            <Route
              exact
              path={match.url + "/questions/:_id"}
              name="Edit Question"
              component={EditQuestion}
            />
          </Switch>
        </Layout>
      </Fragment>
    );
  }
}

export default Admin;
