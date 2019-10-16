import React from "react";
import PropTypes from "prop-types";
import { Card, Form } from "semantic-ui-react";

const QuestionPublishedStatus = props => (
  <Card fluid>
    <Card.Content>Published Status</Card.Content>
    <Card.Content>
      <Form.Radio
        name="publishedstatus"
        label="Draft"
        value="false"
        checked={props.publishedStatus === "false"}
        onChange={(event, value) =>
          props.questionPublishedChangedHandler(event, value)
        }
      />
      <Form.Radio
        name="publishedstatus"
        label="Published"
        value="true"
        checked={props.publishedStatus === "true"}
        onChange={(event, value) =>
          props.questionPublishedChangedHandler(event, value)
        }
      />
    </Card.Content>
    <Card.Content extra>
      <p>Questions with Draft status are not displayed in the game.</p>
    </Card.Content>
  </Card>
);

QuestionPublishedStatus.propTypes = {
  publishedStatus: PropTypes.string,
  questionPublishedChangedHandler: PropTypes.func
};

export default QuestionPublishedStatus;
