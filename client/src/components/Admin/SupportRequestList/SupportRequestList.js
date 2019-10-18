import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Grid, Pagination, Button, Icon } from "semantic-ui-react";
import format from "date-fns/format";
import DeleteSupportRequestModal from "./DeleteSupportRequestModal";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_SUPPORTREQUESTPAGE from "../../../apollo/queries/supportRequestPage";

const SupportRequestList = props => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit
  };

  const { loading, data: { supportRequestPage } = {}, fetchMore } = useQuery(
    QUERY_SUPPORTREQUESTPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network"
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

  const { match, history } = props;

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>From</Table.HeaderCell>
            <Table.HeaderCell>Date Sent</Table.HeaderCell>
            <Table.HeaderCell>Subject</Table.HeaderCell>
            <Table.HeaderCell>Text</Table.HeaderCell>
            <Table.HeaderCell>Reply Sent</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
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
              {supportRequestPage.requests.length ? (
                supportRequestPage.requests.map(request => (
                  <Table.Row key={request._id}>
                    <Table.Cell collapsing>{request.from}</Table.Cell>
                    <Table.Cell collapsing>
                      {format(
                        new Date(Number(request.createdAt)),
                        "EEEE, LLLL do, yyyy"
                      )}
                    </Table.Cell>
                    <Table.Cell>{request.subject}</Table.Cell>
                    <Table.Cell>{request.text}</Table.Cell>
                    <Table.Cell collapsing>
                      {request.replysent ? "Yes" : "No"}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      {request.resolved ? "Closed" : "Open"}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <div>
                        <Button
                          icon
                          size="mini"
                          onClick={() =>
                            history.push(`${match.url}/${request._id}`)
                          }
                        >
                          <Icon name="edit" />
                        </Button>
                        <DeleteSupportRequestModal
                          supportrequestid={request._id}
                          variables={variables}
                        />
                      </div>
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
                <Table.HeaderCell colSpan="7">
                  <Grid columns="equal">
                    <Grid.Column width={2}>
                      <div className="tableItemNumbers">
                        <p>
                          {supportRequestPage.totalrecords} item
                          {supportRequestPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {supportRequestPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={supportRequestPage.pages}
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

SupportRequestList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default SupportRequestList;
