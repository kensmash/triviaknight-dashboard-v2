import React from "react";
import PropTypes from "prop-types";
import { Card, Form, Radio } from "semantic-ui-react";
import FormErrorMessage from "../../../../components/FormMessage/FormErrorMessage";

const QuestionType = props => (
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
      <FormErrorMessage
        reveal={props.errormessage !== ""}
        errormessage={props.errormessage}
      />
    </Card.Content>
  </Card>
);

QuestionType.propTypes = {
  questionTypeSelectHandler: PropTypes.func,
  selectedQuestionType: PropTypes.string,
  errormessage: PropTypes.string
};

export default QuestionType;
