import React from "react";
import PropTypes from "prop-types";
import { Card, Form, Radio } from "semantic-ui-react";
import FormErrorMessage from "../../../../components/FormMessage/FormErrorMessage";

const QuestionDifficulty = props => (
  <Card fluid>
    <Card.Content>Difficulty</Card.Content>
    <Card.Content>
      <Form.Field>
        <Radio
          label="Normal"
          name="difficulty"
          value="Normal"
          checked={props.selectedQuestionDifficulty === "Normal"}
          onChange={(event, value) =>
            props.questionDifficultySelectHandler(event, value)
          }
        />
      </Form.Field>
      <Form.Field>
        <Radio
          label="Hard"
          name="difficulty"
          value="Hard"
          checked={props.selectedQuestionDifficulty === "Hard"}
          onChange={(event, value) =>
            props.questionDifficultySelectHandler(event, value)
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

QuestionDifficulty.propTypes = {
  questionDifficultySelectHandler: PropTypes.func.isRequired,
  selectedQuestionDifficulty: PropTypes.string,
  errormessage: PropTypes.string
};

export default QuestionDifficulty;
