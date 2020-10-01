import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Header,
  Table,
  Button,
  Icon,
  Grid,
  Form,
  Select,
  Input,
  Pagination,
} from "semantic-ui-react";
//components
import CategorySelect from "./helpers/CategorySelect";
import DifficultySelect from "./helpers/DifficultySelect";
import TypeSelect from "./helpers/TypeSelect";
import StatusSelect from "./helpers/StatusSelect";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import QUERY_QUESTIONSPAGE from "../../../apollo/queries/questionsPage";
import QUERY_QUESTIONSEARCHCRITERIA from "../../../apollo/queries/client-questionSearchCriteria";

const QuestionsList = (props) => {
  const [perPageOptions] = useState([
    { value: 10, text: "10" },
    { value: 15, text: "15" },
    { value: 20, text: "20" },
  ]);

  const { data: { questionSearchCriteria } = {} } = useQuery(
    QUERY_QUESTIONSEARCHCRITERIA
  );

  const variables = {
    offset:
      questionSearchCriteria.limit *
        parseInt(questionSearchCriteria.activePage, 10) -
      questionSearchCriteria.limit,
    limit: questionSearchCriteria.limit,
    question: questionSearchCriteria.question,
    category: questionSearchCriteria.category,
    difficulty: questionSearchCriteria.difficulty,
    type: questionSearchCriteria.type,
    published: questionSearchCriteria.publishedstatus,
  };

  const { loading, data: { questionspage } = {}, fetchMore } = useQuery(
    QUERY_QUESTIONSPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        //change currently selected page when no records for page greated than 1
        if (
          !data.questionspage.questions.length &&
          questionSearchCriteria.activePage > 1
        ) {
          updateQuestionSearch({
            variables: {
              ...questionSearchCriteria,
              activePage: 1,
            },
          });
        }
      },
    }
  );

  const [updateQuestionSearch] = useMutation(MUTATION_UPDATEQUESTIONSEARCH);

  const perPageChangeHandler = (_e, data) => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        limit: data.value,
      },
    });
  };

  const inputChangedHandler = (event) => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        question: event.target.value,
      },
    });
  };

  const clearQuestionSearchHandler = () => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        question: "",
      },
    });
  };

  const categorySelectHandler = (_e, data) => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        category: data.value,
      },
    });
  };

  const difficultySelectHandler = (_e, data) => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        difficulty: data.value,
      },
    });
  };

  const typeSelectHandler = (_e, data) => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        type: data.value,
      },
    });
  };

  const publishedSelectHandler = (_e, data) => {
    updateQuestionSearch({
      variables: {
        ...questionSearchCriteria,
        publishedstatus: data.value === "" ? null : data.value,
      },
    });
  };

  const { match } = props;

  return (
    <>
      <Grid columns="equal" className="searchCriteria">
        <Grid.Row>
          <Grid.Column width={4}>
            <Header as="h2">Questions</Header>
          </Grid.Column>
          <Grid.Column className="tablePerPageColumn">
            <Form>
              <Form.Group inline>
                <Form.Field
                  control={Select}
                  label="Per Page:"
                  options={perPageOptions}
                  value={questionSearchCriteria.limit}
                  onChange={(event, data) => perPageChangeHandler(event, data)}
                />
              </Form.Group>
            </Form>
          </Grid.Column>
          <Grid.Column className="tablePerPageColumn">
            <Input icon fluid>
              <input
                placeholder="Search by Question"
                value={questionSearchCriteria.question}
                onChange={inputChangedHandler}
              />

              {questionSearchCriteria.question !== "" ? (
                <Button icon="x" onClick={() => clearQuestionSearchHandler()} />
              ) : (
                <Icon name="search" />
              )}
            </Input>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column
            className="tablePerPageColumn"
            mobile={16}
            tablet={8}
            computer={4}
          >
            <TypeSelect
              value={questionSearchCriteria.type}
              typeSelectHandler={(event, data) =>
                typeSelectHandler(event, data)
              }
            />
          </Grid.Column>
          <Grid.Column
            className="tablePerPageColumn"
            mobile={16}
            tablet={8}
            computer={4}
          >
            <CategorySelect
              value={questionSearchCriteria.category}
              categorySelectHandler={(event, data) =>
                categorySelectHandler(event, data)
              }
            />
          </Grid.Column>
          <Grid.Column
            className="tablePerPageColumn mobileColumn"
            mobile={16}
            tablet={8}
            computer={4}
          >
            <DifficultySelect
              value={questionSearchCriteria.difficulty}
              difficultySelectHandler={(event, data) =>
                difficultySelectHandler(event, data)
              }
            />
          </Grid.Column>
          <Grid.Column
            className="tablePerPageColumn mobileColumn"
            mobile={16}
            tablet={8}
            computer={4}
          >
            <StatusSelect
              value={questionSearchCriteria.publishedstatus}
              publishedSelectHandler={(event, data) =>
                publishedSelectHandler(event, data)
              }
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Question</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
            <Table.HeaderCell>Difficulty</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        {loading ? (
          <Table.Body>
            <Table.Row>
              <Table.Cell>Loading...</Table.Cell>
            </Table.Row>
          </Table.Body>
        ) : (
          <>
            <Table.Body>
              {questionspage.questions.length ? (
                questionspage.questions.map((ques) => (
                  <Table.Row key={ques._id}>
                    <Table.Cell>
                      <Link to={`${match.url}/${ques._id}`}>
                        {ques.question}
                      </Link>
                    </Table.Cell>
                    <Table.Cell className="publishedstatuscell">
                      {ques.published ? "Published" : "Draft"}
                    </Table.Cell>
                    <Table.Cell>
                      {ques.category && ques.category.name
                        ? ques.category.name
                        : null}
                    </Table.Cell>
                    <Table.Cell>{ques.difficulty}</Table.Cell>
                    <Table.Cell>{ques.type}</Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell>
                    <p>Sorry, no records matched your search.</p>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan="5">
                  <Grid columns="equal">
                    <Grid.Column width={2}>
                      <div className="tableItemNumbers">
                        <p>
                          {questionspage.totalrecords} item
                          {questionspage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {questionspage.pages >= 2 ? (
                        <Pagination
                          activePage={questionSearchCriteria.activePage}
                          totalPages={questionspage.pages}
                          onPageChange={(e, { activePage }) =>
                            updateQuestionSearch({
                              variables: {
                                ...questionSearchCriteria,
                                activePage,
                              },
                            }).then(() =>
                              fetchMore({
                                variables: {
                                  offset:
                                    questionSearchCriteria.limit *
                                      parseInt(activePage, 10) -
                                    questionSearchCriteria.limit,
                                },
                                updateQuery: (prev, { fetchMoreResult }) => {
                                  if (!fetchMoreResult) return prev;
                                  return fetchMoreResult;
                                },
                              })
                            )
                          }
                        />
                      ) : null}
                    </Grid.Column>
                  </Grid>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </>
        )}
      </Table>
    </>
  );
};

const MUTATION_UPDATEQUESTIONSEARCH = gql`
  mutation updateQuestionSearch(
    $activePage: activePage
    $limit: Int
    $question: String
    $category: ID
    $difficulty: String
    $type: String
    $publishedstatus: String
  ) {
    updateQuestionSearch(
      activePage: $activePage
      limit: $limit
      question: $question
      category: $category
      difficulty: $difficulty
      type: $type
      publishedstatus: $publishedstatus
    ) @client {
      activePage
      limit
      question
      category
      difficulty
      type
      publishedstatus
    }
  }
`;

QuestionsList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default QuestionsList;
