import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Grid, Card, Form, Button, Icon } from "semantic-ui-react";
//components
import Answer from "./helpers/Answer";
import QuestionPublishedStatus from "./helpers/QuestionPublishedStatus";
import CategorySelect from "./helpers/CategorySelect";
import QuestionType from "./helpers/QuestionType";
import QuestionDifficulty from "./helpers/QuestionDifficulty";
import FormErrorMessage from "../../../components/FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../../components/FormMessage/FormSuccessMessage";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

const QuestionForm = props => {
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const initialState = {
    questionSubmitted: false,
    redirect: false,
    fields: {
      question: "",
      answers: [],
      category: {},
      questiontype: "Multiple Choice",
      questiondifficulty: "Normal",
      imageurl: null,
      videourl: null,
      audiourl: null,
      published: false
    },
    fieldErrors: {
      question: "",
      answerindexes: [],
      answer: "",
      answers: "",
      correctanswer: "",
      category: "",
      questiontype: "",
      questiondifficulty: ""
    }
  };

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    categoryname: "",
    type: "",
    categorydescription: ""
  });

  const [upsertQuestion] = useMutation(MUTATION_UPSERTQUESTION);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { category } = props;
      setFields({
        categoryname: category.name,
        categorytype: category.type._id,
        categorygenres: category.genres.map(genre => genre._id),
        categorydescription: category.description,
        published: category.published,
        partycategory: category.partycategory || false,
        showasnew: category.showasnew || false,
        showasupdated: category.showasupdated || false,
        showaspopular: category.showaspopular || false,
        joustexclusive: category.joustexclusive || false
      });
    }
  }, [props]);

  gotoQuestionsPageHandler = () => {
    this.clearFormHandler();
    this.setState({ redirect: true });
  };

  questionChangedHandler = event => {
    this.setState({
      fields: {
        ...this.state.fields,
        question: event.target.value
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        question: ""
      }
    });
  };

  answerChangedHandler = (event, index) => {
    const answers = [...this.state.fields.answers];
    answers[index].answer = event.target.value;
    this.setState({
      fields: {
        ...this.state.fields,
        answers
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        answers: "",
        answer: "",
        answerindexes: []
      }
    });
  };

  correctAnswerHandler = (event, value, index) => {
    const answers = [...this.state.fields.answers];
    if (value.checked) {
      answers.forEach(answer => (answer.correct = false));
      answers[index].correct = true;
    } else {
      answers[index].correct = false;
    }
    this.setState({
      fields: {
        ...this.state.fields,
        answers
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        answers: ""
      }
    });
  };

  addAnswerHander = () => {
    const answers = [...this.state.fields.answers];
    answers.push({ answer: "", correct: false });
    this.setState({
      fields: {
        ...this.state.fields,
        answers: answers
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        answers: "",
        answer: "",
        answerindexes: []
      }
    });
  };

  removeAnswerHandler = index => {
    const answers = [...this.state.fields.answers];
    answers.splice(index, 1);
    this.setState({
      fields: {
        ...this.state.fields,
        answers: answers
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        answers: "",
        answer: "",
        answerindexes: []
      }
    });
  };

  questionPublishedChangedHandler = (event, value) => {
    this.setState({
      fields: {
        ...this.state.fields,
        published: value.value === "true" ? true : false
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        correctanswer: ""
      }
    });
  };

  questionCategorySelectHandler = categoryvalue => {
    this.props.updateAddQuestionCriteria({
      variables: {
        category: categoryvalue === null ? "" : categoryvalue.value
      }
    });
    this.setState({
      fields: {
        ...this.state.fields,
        category: categoryvalue === null ? {} : categoryvalue
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        category: ""
      }
    });
  };

  questionTypeSelectHandler = (event, value) => {
    this.clearValidationHandler();
    this.setState({
      fields: {
        ...this.state.fields,
        questiontype: value.value
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        questiontype: ""
      }
    });
  };

  questionDifficultySelectHandler = (event, value) => {
    this.clearValidationHandler();
    this.setState({
      fields: {
        ...this.state.fields,
        questiondifficulty: value.value
      },
      fieldErrors: {
        ...this.state.fieldErrors,
        questiondifficulty: ""
      }
    });
  };

  formValidateHandler = (question, answers, category, type, difficulty) => {
    const errors = {};
    const emptyanswers = this.state.fields.answers.filter(
      answer => answer.answer === ""
    );
    const allanswers = this.state.fields.answers.map(answer => answer.answer);
    const duplicateanswers = allanswers.some((answer, index) => {
      return allanswers.indexOf(answer) !== index;
    });

    if (question.length < 8)
      errors.question = "Please enter question at least 8 characters long.";

    if (
      this.state.fields.published &&
      !this.state.fields.answers.filter(answer => answer.correct).length
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
        if (duplicates.some(duplicate => duplicate === answer)) {
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

    if (!Object.keys(category).length)
      errors.category = "Please select a category.";
    if (!type.length) errors.questiontype = "Please select a question type.";
    if (!difficulty.length)
      errors.questiondifficulty = "Please select a question difficulty.";
    return errors;
  };

  clearValidationHandler = () => {
    this.setState({
      fieldErrors: {
        question: "",
        answerindexes: [],
        answer: "",
        answers: "",
        correctanswer: "",
        category: "",
        questiontype: "",
        questiondifficulty: ""
      }
    });
  };

  formSubmitHandler = event => {
    event.preventDefault();
    const { fields } = this.state;
    const errors = this.formValidateHandler(
      fields.question,
      fields.answers,
      this.props.pageType === "edit"
        ? fields.category
        : this.props.addQuestionCriteria.category,
      fields.questiontype,
      fields.questiondifficulty
    );
    if (Object.keys(errors).length)
      return this.setState({
        fieldErrors: { ...this.state.fieldErrors, ...errors }
      });
    this.AddorEdit();
  };

  AddorEdit = () => {
    if (this.props.pageType === "edit") {
      this.EditQuestionHandler();
    } else {
      this.AddQuestionHandler();
    }
  };

  AddQuestionHandler = async () => {
    const {
      question,
      answers,
      category,
      questiontype,
      questiondifficulty,
      imageurl,
      videourl,
      audiourl,
      published
    } = this.state.fields;
    //add question
    const graphqlResponse = await this.props.addQuestion({
      variables: {
        input: {
          question,
          answers,
          category: this.props.addQuestionCriteria.category,
          type: questiontype,
          difficulty: questiondifficulty,
          imageurl,
          videourl,
          audiourl,
          published
        }
      }
    });
    this.setState({
      questionSubmitted: true
    });
  };

  EditQuestionHandler = async () => {
    const questionid = this.props.question._id;
    const {
      question,
      answers,
      category,
      questiontype,
      questiondifficulty,
      imageurl,
      videourl,
      audiourl,
      published
    } = this.state.fields;
    const graphqlResponse = await this.props.editQuestion({
      variables: {
        input: {
          id: questionid,
          question,
          answers,
          category: category.value,
          type: questiontype,
          difficulty: questiondifficulty,
          imageurl,
          videourl,
          audiourl,
          published
        }
      }
    });
    this.setState({
      questionSubmitted: true
    });
  };

  clearFormHandler = () => {
    this.setState({
      questionSubmitted: false,
      fields: {
        question: "",
        answers: [
          { answer: "", correct: false },
          { answer: "", correct: false },
          { answer: "", correct: false },
          { answer: "", correct: false }
        ],
        category: {},
        questiontype: "Multiple Choice",
        questiondifficulty: "Normal",
        imageurl: null,
        videourl: null,
        audiourl: null,
        published: false
      }
    });
  };

  return (
    <>
      <Form>
        <h3>
          {this.props.pageType === "edit" ? "Edit Question" : "New Question"}
        </h3>
        <Card fluid>
          <Card.Content>Question</Card.Content>
          <Card.Content>
            <Form.Field>
              <input
                id="question"
                placeholder="Enter question..."
                value={fields.question}
                onChange={event => this.questionChangedHandler(event)}
              />
              <FormErrorMessage
                reveal={this.state.fieldErrors.question !== ""}
                errormessage={this.state.fieldErrors.question}
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
                        onClick={this.addAnswerHander}
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
                      answerChangedHandler={this.answerChangedHandler}
                      correctAnswerHandler={this.correctAnswerHandler}
                      removeAnswerHandler={this.removeAnswerHandler}
                      clearValidationHandler={this.clearValidationHandler}
                      error={
                        fieldErrors.answerindexes.length > 0 &&
                        fieldErrors.answerindexes.includes(index)
                      }
                      errormessage={this.state.fieldErrors.answer}
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
              //selectedCategory={selectedCategory}
              selectedCategory={
                this.props.pageType === "edit"
                  ? fields.category.value
                  : this.props.addQuestionCriteria.category
              }
              questionCategorySelectHandler={this.questionCategorySelectHandler}
              errormessage={this.state.fieldErrors.category}
            />
            <QuestionType
              addQuestionType={this.props.addQuestionType}
              selectedQuestionType={fields.questiontype}
              questionTypeSelectHandler={this.questionTypeSelectHandler}
              errormessage={this.state.fieldErrors.questiontype}
            />
            <QuestionDifficulty
              selectedQuestionDifficulty={fields.questiondifficulty}
              questionDifficultySelectHandler={
                this.questionDifficultySelectHandler
              }
              errormessage={this.state.fieldErrors.questiondifficulty}
            />
            <QuestionPublishedStatus
              publishedStatus={this.state.fields.published ? "true" : "false"}
              questionPublishedChangedHandler={
                this.questionPublishedChangedHandler
              }
            />
          </Grid.Column>
        </Grid>

        <div className="formButtonGroup">
          {!this.state.questionSubmitted ? (
            <Fragment>
              <Button
                color="green"
                size="large"
                onClick={this.formSubmitHandler}
              >
                Submit
              </Button>
              <Button
                color="grey"
                size="large"
                onClick={this.props.history.goBack}
              >
                Cancel
              </Button>
            </Fragment>
          ) : (
            <Fragment>
              {this.props.pageType === "edit" ? (
                <Button primary onClick={this.props.history.goBack}>
                  Go Back
                </Button>
              ) : (
                <Button primary onClick={this.gotoQuestionsPageHandler}>
                  See All Questions
                </Button>
              )}
              <Button primary onClick={this.clearFormHandler}>
                Add New Question
              </Button>
            </Fragment>
          )}
        </div>
        <FormSuccessMessage
          reveal={this.state.questionSubmitted}
          header={
            this.props.pageType === "edit"
              ? "Question Updated"
              : "Question Added"
          }
          content={
            this.props.pageType === "edit"
              ? "You've successfully updated the question."
              : "You've successfully added the question."
          }
        />
      </Form>
    </>
  );
};

const MUTATION_UPSERTQUESTION = gql`
  mutation upsertQuestion($input: editQuestionInput) {
    upsertquestion(input: $input) {
      _id
      question
    }
  }
`;

QuestionForm.propTypes = {
  pageType: PropTypes.string,
  category: PropTypes.object,
  history: PropTypes.object
};

export default QuestionForm;
