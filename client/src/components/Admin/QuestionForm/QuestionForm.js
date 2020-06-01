import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { Grid, Card, Form, Button, Icon } from "semantic-ui-react";
//components
import Answer from "./helpers/Answer";
import QuestionPublishedStatus from "./helpers/QuestionPublishedStatus";
import CategorySelect from "./helpers/CategorySelect";
import QuestionType from "./helpers/QuestionType";
import QuestionDifficulty from "./helpers/QuestionDifficulty";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import QUERY_CLIENTADDQUESTIONCRITERIA from "../../../apollo/queries/client-addQuestionCriteria";

const QuestionForm = (props) => {
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [pageType, setPageType] = useState("New Question");
  const [fields, setFields] = useState({
    question: "",
    answers: [
      { answer: "", correct: false },
      { answer: "", correct: false },
      { answer: "", correct: false },
      { answer: "", correct: false },
    ],
    category: "",
    questiontype: "Multiple Choice",
    questiondifficulty: "Normal",
    imageurl: null,
    videourl: null,
    audiourl: null,
    published: false,
    guessable: true,
  });
  const [fieldErrors, setFieldErrors] = useState({
    question: "",
    answerindexes: [],
    answer: "",
    answers: "",
    correctanswer: "",
    category: "",
    questiontype: "",
    questiondifficulty: "",
  });

  const { data: { addQuestionCriteria } = {} } = useQuery(
    QUERY_CLIENTADDQUESTIONCRITERIA
  );

  const [upsertQuestion, { loading }] = useMutation(MUTATION_UPSERTQUESTION);
  const [updateAddQuestionCriteria] = useMutation(
    MUTATION_UPDATEADDQUESTIONCRITERIA
  );

  useEffect(() => {
    if (props.pageType === "edit" && pageType !== "Edit") {
      const { question } = props;

      setPageType("Edit");
      setFields({
        question: question.question,
        answers: question.answers.map((question) => ({
          answer: question.answer,
          correct: question.correct,
        })),
        category: question.category._id,
        questiontype: question.type,
        questiondifficulty: question.difficulty,
        imageurl: question.imageurl,
        videourl: question.videourl,
        audiourl: question.audiourl,
        published: question.published,
        guessable: question.guessable,
      });
      updateAddQuestionCriteria({
        variables: {
          category: props.question.category._id,
        },
      });
    }
  }, [props, updateAddQuestionCriteria, pageType]);

  const gotoQuestionsPageHandler = () => {
    clearFormHandler();
    setRedirect(true);
  };

  const questionChangedHandler = (event) => {
    setFields({ ...fields, question: event.target.value });
    setFieldErrors({
      ...fieldErrors,
      question: "",
    });
  };

  const answerChangedHandler = (event, index) => {
    const answers = [...fields.answers];
    answers[index].answer = event.target.value;
    setFields({ ...fields, answers });
    setFieldErrors({
      ...fieldErrors,
      answers: "",
      answer: "",
      answerindexes: [],
    });
  };

  const correctAnswerHandler = (_event, value, index) => {
    const answers = [...fields.answers];
    if (value.checked) {
      answers.forEach((answer) => (answer.correct = false));
      answers[index].correct = true;
    } else {
      answers[index].correct = false;
    }
    setFields({ ...fields, answers });
    setFieldErrors({
      ...fieldErrors,
      answers: "",
    });
  };

  const guessableHandler = (_event, value) => {
    if (value.checked) {
      setFields({ ...fields, guessable: true });
    } else {
      console.log(false);
      setFields({ ...fields, guessable: false });
    }
  };

  const addAnswerHander = () => {
    const answers = [...fields.answers];
    answers.push({ answer: "", correct: false });
    setFields({ ...fields, answers: answers });
    setFieldErrors({
      ...fieldErrors,
      answers: "",
      answer: "",
      answerindexes: [],
    });
  };

  const removeAnswerHandler = (index) => {
    const answers = [...fields.answers];
    answers.splice(index, 1);
    setFields({ ...fields, answers: answers });
    setFieldErrors({
      ...fieldErrors,
      answers: "",
      answer: "",
      answerindexes: [],
    });
  };

  const questionPublishedChangedHandler = (_event, value) => {
    setFields({ ...fields, published: value.value === "true" ? true : false });
    setFieldErrors({ ...fieldErrors, correctanswer: "" });
  };

  const categorySelectHandler = (_event, data) => {
    updateAddQuestionCriteria({
      variables: {
        category: data.value,
      },
    });
    setFields({ ...fields, category: data.value });
    setFieldErrors({ ...fieldErrors, category: "" });
  };

  const questionTypeSelectHandler = (_event, value) => {
    clearValidationHandler();
    setFields({ ...fields, questiontype: value.value });
    setFieldErrors({ ...fieldErrors, questiontype: "" });
  };

  const questionDifficultySelectHandler = (_event, value) => {
    clearValidationHandler();
    setFields({ ...fields, questiondifficulty: value.value });
    setFieldErrors({ ...fieldErrors, questiondifficulty: "" });
  };

  const formValidateHandler = (question, answers, type, difficulty) => {
    const errors = {};
    const emptyanswers = fields.answers.filter(
      (answer) => answer.answer === ""
    );
    const allanswers = fields.answers.map((answer) => answer.answer);
    const duplicateanswers = allanswers.some((answer, index) => {
      return allanswers.indexOf(answer) !== index;
    });

    if (question.length < 8)
      errors.question = "Please enter question at least 8 characters long.";

    if (
      fields.published &&
      !fields.answers.filter((answer) => answer.correct).length
    )
      errors.answers = "Don't forget to select a correct answer!";
    if (duplicateanswers) {
      //https://js-algorithms.tutorialhorizon.com/2016/01/25/find-duplicates-in-an-array/
      let duplicates = [];
      allanswers.forEach((answer, index) => {
        // Find duplicates
        if (allanswers.indexOf(answer, index + 1) > -1) {
          // Find if the element is already in the result array or not
          if (duplicates.indexOf(answer) === -1) {
            duplicates.push(answer);
          }
        }
      });
      //now get the duplicate answer indexes
      let duplicatesindex = [];
      allanswers.forEach((answer, index) => {
        if (duplicates.some((duplicate) => duplicate === answer)) {
          duplicatesindex.push(allanswers.indexOf(answer, index));
        }
      });
      errors.answer =
        "Duplicate answers are not allowed. Please make sure each answer is unique.";
      errors.answerindexes = duplicatesindex;
    }
    if (emptyanswers.length) {
      let emptiesindex = [];
      allanswers.forEach((answer, index) => {
        if (answer === "") {
          emptiesindex.push(allanswers.indexOf(answer, index));
        }
      });
      errors.answer =
        "Empty answers are not allowed. Please enter an answer, or delete this answer field.";
      errors.answerindexes = emptiesindex;
    }
    if (answers.length < 2)
      errors.answers = "Please enter at least two answers.";

    if (!addQuestionCriteria.category.length)
      errors.category = "Please select a category.";
    if (!type.length) errors.questiontype = "Please select a question type.";
    if (!difficulty.length)
      errors.questiondifficulty = "Please select a question difficulty.";
    return errors;
  };

  const clearValidationHandler = () => {
    setFieldErrors({
      question: "",
      answerindexes: [],
      answer: "",
      answers: "",
      correctanswer: "",
      category: "",
      questiontype: "",
      questiondifficulty: "",
    });
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();
    const errors = formValidateHandler(
      fields.question,
      fields.answers,
      addQuestionCriteria.category,
      fields.questiontype,
      fields.questiondifficulty
    );
    if (Object.keys(errors).length)
      return setFieldErrors({ ...fieldErrors, ...errors });
    UpsertQuestionHandler();
  };

  const UpsertQuestionHandler = async () => {
    const {
      question,
      answers,
      questiontype,
      questiondifficulty,
      imageurl,
      videourl,
      audiourl,
      published,
      guessable,
    } = fields;

    //add question
    await upsertQuestion({
      variables: {
        input: {
          id: props.pageType === "edit" ? props.question._id : null,
          question,
          answers,
          category: addQuestionCriteria.category,
          type: questiontype,
          difficulty: questiondifficulty,
          imageurl,
          videourl,
          audiourl,
          published,
          guessable,
        },
      },
    });
    setQuestionSubmitted(true);
  };

  const clearFormHandler = () => {
    setQuestionSubmitted(false);
    setFields({
      question: "",
      answers: [
        { answer: "", correct: false },
        { answer: "", correct: false },
        { answer: "", correct: false },
        { answer: "", correct: false },
      ],
      category: "",
      questiontype: "Multiple Choice",
      questiondifficulty: "Normal",
      imageurl: null,
      videourl: null,
      audiourl: null,
      published: false,
      guessable: true,
    });
  };

  if (redirect) {
    return <Redirect to="/admin/questions" />;
  }

  return (
    <>
      <Form>
        <h3>{props.pageType === "edit" ? "Edit Question" : "New Question"}</h3>
        <Card fluid>
          <Card.Content>Question</Card.Content>
          <Card.Content>
            <Form.Field>
              <input
                id="question"
                placeholder="Enter question..."
                value={fields.question}
                onChange={(event) => questionChangedHandler(event)}
              />
              <FormErrorMessage
                reveal={fieldErrors.question !== ""}
                errormessage={fieldErrors.question}
              />
            </Form.Field>
          </Card.Content>
        </Card>
        <Grid>
          <Grid.Column mobile={16} computer={10}>
            <Card fluid className="stretchCard">
              <Card.Content>
                <Grid>
                  <Grid.Column width={10}>
                    <p>Answers</p>
                  </Grid.Column>
                  <Grid.Column width={6} textAlign="right">
                    {fields.answers.length <= 3 ? (
                      <Button
                        className="button-addnew"
                        icon
                        size="mini"
                        compact
                        labelPosition="left"
                        onClick={addAnswerHander}
                      >
                        <Icon name="plus" />
                        Add Answer
                      </Button>
                    ) : null}
                  </Grid.Column>
                </Grid>
              </Card.Content>
              <Card.Content>
                {fields.answers.length ? (
                  fields.answers.map((answer, index) => (
                    <Answer
                      key={index}
                      answerindex={index}
                      answers={fields.answers}
                      answer={fields.answers[index].answer}
                      correct={fields.answers[index].correct}
                      answerChangedHandler={answerChangedHandler}
                      correctAnswerHandler={correctAnswerHandler}
                      removeAnswerHandler={removeAnswerHandler}
                      clearValidationHandler={clearValidationHandler}
                      error={
                        fieldErrors.answerindexes.length > 0 &&
                        fieldErrors.answerindexes.includes(index)
                      }
                      errormessage={fieldErrors.answer}
                    />
                  ))
                ) : (
                  <Card.Meta>Please enter at least two answers.</Card.Meta>
                )}
                <FormErrorMessage
                  reveal={fieldErrors.answers !== ""}
                  errormessage={fieldErrors.answers}
                />
              </Card.Content>
            </Card>
          </Grid.Column>

          <Grid.Column mobile={16} computer={6}>
            <CategorySelect
              selectedCategory={
                props.pageType === "edit"
                  ? fields.category
                  : addQuestionCriteria.category
              }
              categorySelectHandler={categorySelectHandler}
              errormessage={fieldErrors.category}
            />
            <QuestionType
              addQuestionType={props.addQuestionType}
              selectedQuestionType={fields.questiontype}
              questionTypeSelectHandler={questionTypeSelectHandler}
              guessable={fields.guessable}
              guessableHandler={guessableHandler}
            />
            <QuestionDifficulty
              selectedQuestionDifficulty={fields.questiondifficulty}
              questionDifficultySelectHandler={questionDifficultySelectHandler}
              errormessage={fieldErrors.questiondifficulty}
            />
            <QuestionPublishedStatus
              publishedStatus={fields.published ? "true" : "false"}
              questionPublishedChangedHandler={questionPublishedChangedHandler}
            />
          </Grid.Column>
        </Grid>

        <div className="formButtonGroup">
          {!questionSubmitted ? (
            <>
              <Button
                color="green"
                size="large"
                loading={loading}
                onClick={formSubmitHandler}
              >
                Submit
              </Button>
              <Button
                color="grey"
                size="large"
                disabled={loading}
                onClick={props.history.goBack}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {props.pageType === "edit" ? (
                <Button primary onClick={props.history.goBack}>
                  Go Back
                </Button>
              ) : (
                <Button primary onClick={gotoQuestionsPageHandler}>
                  See All Questions
                </Button>
              )}
              <Button primary onClick={clearFormHandler}>
                Add New Question
              </Button>
            </>
          )}
        </div>
        <FormSuccessMessage
          reveal={questionSubmitted}
          header={
            props.pageType === "edit" ? "Question Updated" : "Question Added"
          }
          content={
            props.pageType === "edit"
              ? "You've successfully updated the question."
              : "You've successfully added the question."
          }
        />
      </Form>
    </>
  );
};

const MUTATION_UPSERTQUESTION = gql`
  mutation upsertQuestion($input: upsertQuestionInput) {
    upsertquestion(input: $input) {
      _id
      question
      guessable
    }
  }
`;

const MUTATION_UPDATEADDQUESTIONCRITERIA = gql`
  mutation updateAddQuestionCriteria($category: ID) {
    updateAddQuestionCriteria(category: $category) @client {
      category
    }
  }
`;

QuestionForm.propTypes = {
  pageType: PropTypes.string,
  category: PropTypes.object,
  history: PropTypes.object,
};

export default QuestionForm;
