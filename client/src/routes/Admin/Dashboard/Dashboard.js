import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Card } from "semantic-ui-react";
//big widgets

//smaller widgets

const Dashboard = ({ match, history }) => (
  <Fragment>
    <Card.Group itemsPerRow={3}></Card.Group>
    <Card.Group itemsPerRow={4}></Card.Group>
  </Fragment>
);

Dashboard.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object
};

export default Dashboard;
