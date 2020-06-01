import React from "react";
import PropTypes from "prop-types";
import { Transition, Card, Form, Radio, Checkbox } from "semantic-ui-react";

const QuestionType = (props) => (
  <Card fluid>
    <Card.Content>Type</Card.Content>
    <Card.Content>
      <Form.Field>
        <Radio
          label="Multiple Choice"
          name="type"
          value="Multiple Choice"
          checked={props.selectedQuestionType === "Multiple Choice"}
          onChange={(event, value) =>
            props.questionTypeSelectHandler(event, value)
          }
        />
      </Form.Field>
      <Form.Field>
        <Radio
          label="True/False"
          name="type"
          value="True/False"
          checked={props.selectedQuestionType === "True/False"}
          onChange={(event, value) =>
            props.questionTypeSelectHandler(event, value)
          }
        />
      </Form.Field>
    </Card.Content>

    <Transition
      visible={props.selectedQuestionType === "Multiple Choice"}
      animation="slide down"
      duration={400}
    >
      <Card.Content extra>
        <Form.Field>
          <Checkbox
            label="Guessable"
            checked={props.guessable}
            onChange={(event, value) => props.guessableHandler(event, value)}
          />
        </Form.Field>
      </Card.Content>
    </Transition>
  </Card>
);

QuestionType.propTypes = {
  questionTypeSelectHandler: PropTypes.func,
  selectedQuestionType: PropTypes.string,
  errormessage: PropTypes.string,
  guessable: PropTypes.bool,
  guessableHandler: PropTypes.func,
};

export default QuestionType;
