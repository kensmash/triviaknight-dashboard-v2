import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Card } from "semantic-ui-react";
//big widgets
import UsersWidget from "../../../components/Admin/Dashboard/UsersWidget";
import QuestionsWidget from "../../../components/Admin/Dashboard/QuestionsWidget";
import CategoriesWidget from "../../../components/Admin/Dashboard/CategoriesWidget";
//smaller widgets
import QuestionReportsWidget from "../../../components/Admin/Dashboard/QuestionReportsWidget";
import QuestTopicWidget from "../../../components/Admin/Dashboard/QuestTopicWidget";
import PushTicketsWidget from "../../../components/Admin/Dashboard/PushTicketsWidget";
import PushReceiptsWidget from "../../../components/Admin/Dashboard/PushReceiptsWidget";

const Dashboard = ({ match, history }) => (
  <Fragment>
    <Card.Group stackable itemsPerRow={3}>
      <UsersWidget history={history} />
      <QuestionsWidget history={history} />
      <CategoriesWidget history={history} />
    </Card.Group>
    <Card.Group stackable itemsPerRow={4}>
      <QuestTopicWidget history={history} />
      <QuestionReportsWidget history={history} />

      <PushTicketsWidget history={history} />
      <PushReceiptsWidget history={history} />
    </Card.Group>
  </Fragment>
);

Dashboard.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
};

export default Dashboard;
