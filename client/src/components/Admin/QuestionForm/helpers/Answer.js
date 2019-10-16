import React from "react";
import PropTypes from "prop-types";
import FormErrorMessage from "../../../../components/FormMessage/FormErrorMessage";
import { Grid, Icon, Button, Form, Checkbox } from "semantic-ui-react";

const Answer = props => {
  const answerindex = props.answerindex || 0;
  return (
    <div className="answer">
      <Grid>
        <Grid.Column width={14}>
          <p>Answer {props.answerindex + 1}</p>
        </Grid.Column>
        <Grid.Column width={2} textAlign="right">
          <Button
            basic
            icon
            size="mini"
            onClick={() => props.removeAnswerHandler(answerindex)}
          >
            <Icon name="x" />
          </Button>
        </Grid.Column>
      </Grid>

      <Form.Input
        className="answerinput"
        fluid
        id="answer"
        name="answer"
        value={props.answer}
        placeholder="Enter Answer..."
        onChange={event => props.answerChangedHandler(event, answerindex)}
      />
      <FormErrorMessage
        reveal={props.error}
        errormessage={props.errormessage}
      />
      <Form.Field>
        <Checkbox
          label="Check this box if this is the correct answer."
          checked={props.answers[answerindex].correct}
          onChange={(event, value) =>
            props.correctAnswerHandler(event, value, answerindex)
          }
        />
      </Form.Field>
    </div>
  );
};

Answer.propTypes = {
  answerindex: PropTypes.number,
  answers: PropTypes.array,
  answer: PropTypes.string,
  correct: PropTypes.bool,
  answerChangedHandler: PropTypes.func.isRequired,
  removeAnswerHandler: PropTypes.func.isRequired,
  correctAnswerHandler: PropTypes.func.isRequired,
  error: PropTypes.bool,
  errormessage: PropTypes.string
};

export default Answer;
