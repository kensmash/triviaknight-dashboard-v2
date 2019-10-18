import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import format from "date-fns/format";
import { Table, Grid, Pagination } from "semantic-ui-react";
import DeleteQuestionReportModal from "./DeleteQuestionReportModal";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_QUESTIONREPORTSPAGE from "../../../apollo/queries/questionReportsPage";

const QuestionReportsList = () => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit
  };

  const { loading, data: { questionReportsPage } = {}, fetchMore } = useQuery(
    QUERY_QUESTIONREPORTSPAGE,
    {
      variables,
      fetchPolicy: "network-only"
    }
  );

  const fetchMoreHandler = activePage => {
    setActivePage(activePage);
    if (activePage > 1) {
      fetchMore({
        variables: {
          offset: limit * parseInt(activePage, 10) - limit
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        }
      });
    }
  };

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Question</Table.HeaderCell>
            <Table.HeaderCell>Date Reported</Table.HeaderCell>
            <Table.HeaderCell>Message</Table.HeaderCell>
            <Table.HeaderCell />
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
              {questionReportsPage.reports.length ? (
                questionReportsPage.reports.map(report => (
                  <Table.Row key={report._id}>
                    <Table.Cell collapsing>
                      <Link to={`${report.question._id}`}>
                        {report.question.question}
                      </Link>
                    </Table.Cell>
                    <Table.Cell collapsing>
                      {format(
                        new Date(report.createdAt),
                        "dddd, MMMM Do, YYYY"
                      )}
                    </Table.Cell>
                    <Table.Cell>{report.message}</Table.Cell>
                    <Table.Cell collapsing>
                      <DeleteQuestionReportModal
                        questionreportid={report._id}
                        variables={variables}
                      />
                    </Table.Cell>
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
                <Table.HeaderCell colSpan="6">
                  <Grid columns="equal">
                    <Grid.Column width={2}>
                      <div className="tableItemNumbers">
                        <p>
                          {questionReportsPage.totalrecords} item
                          {questionReportsPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {questionReportsPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={questionReportsPage.pages}
                          onPageChange={(e, { activePage }) =>
                            fetchMoreHandler({ activePage })
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

QuestionReportsList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default QuestionReportsList;
