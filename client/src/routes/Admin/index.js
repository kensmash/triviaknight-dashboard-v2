import React from "react";
import { Switch, Route } from "react-router-dom";
import Layout from "../../components/Admin/Layout/Layout";
//Dashboard
import Dashboard from "./Dashboard/Dashboard";
//announcements
import Announcements from "./Announcements/Announcements";
import EditAnnouncement from "./EditAnnouncement/EditAnnouncement";
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
import QuestionReports from "./QuestionReports/QuestionReports";
//games
import GamesJoust from "./GamesJoust/GamesJoust";
import GamesSiege from "./GamesSiege/GamesSiege";
//support
import SupportRequests from "./SupportRequests/SupportRequests";
//push notifications
import PushTickets from "./PushTickets/PushTickets";
import PushReceipts from "./PushReceipts/PushReceipts";
//users
import Users from "./Users/Users";

// when the url matches `/admin` this component renders
const Admin = ({ match }) => {
  return (
    <>
      <Layout>
        <Switch>
          <Route exact path={match.url + "/"} component={Dashboard} />
          <Route
            exact
            path={match.url + "/announcements"}
            component={Announcements}
          />
          <Route
            exact
            path={match.url + "/announcements/:_id"}
            name="Edit Announcement"
            component={EditAnnouncement}
          />
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
          <Route exact path={match.url + "/questions"} component={Questions} />
          <Route
            exact
            path={match.url + "/questions/new"}
            name="New Question"
            component={NewQuestion}
          />
          <Route
            exact
            path={match.url + "/questions/reports"}
            name="Question Reports"
            component={QuestionReports}
          />
          <Route
            exact
            path={match.url + "/questions/:_id"}
            name="Edit Question"
            component={EditQuestion}
          />
          <Route
            exact
            path={match.url + "/joustgames"}
            name="Joust Games"
            component={GamesJoust}
          />
          <Route
            exact
            path={match.url + "/siegegames"}
            name="Siege Games"
            component={GamesSiege}
          />
          <Route
            exact
            path={match.url + "/users"}
            name="Users"
            component={Users}
          />
          <Route
            exact
            path={match.url + "/supportrequests"}
            name="Support Requests"
            component={SupportRequests}
          />
          <Route
            exact
            path={match.url + "/pushtickets"}
            component={PushTickets}
          />
          <Route
            exact
            path={match.url + "/pushreceipts"}
            component={PushReceipts}
          />
        </Switch>
      </Layout>
    </>
  );
};

export default Admin;
