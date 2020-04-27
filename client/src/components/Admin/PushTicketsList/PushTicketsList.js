import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table, Grid, Pagination } from "semantic-ui-react";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_PUSHTICKETSPAGE from "../../../apollo/queries/pushTicketsPage";

const PushTicketsList = () => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit,
  };

  const { loading, data: { pushTicketsPage } = {}, fetchMore } = useQuery(
    QUERY_PUSHTICKETSPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    if (activePage > 1) {
      fetchMore({
        variables: {
          offset: limit * parseInt(activePage, 10) - limit,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [activePage, fetchMore, limit]);

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Error</Table.HeaderCell>
            <Table.HeaderCell>Receipt Fetched</Table.HeaderCell>
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
              {pushTicketsPage.tickets.length ? (
                pushTicketsPage.tickets.map((ticket) => (
                  <Table.Row key={ticket._id}>
                    <Table.Cell>
                      {ticket.type ? ticket.type : "No type"}
                    </Table.Cell>
                    <Table.Cell>{ticket.id ? ticket.id : "Error"}</Table.Cell>
                    <Table.Cell>
                      {ticket.status ? ticket.status : ticket.code}
                    </Table.Cell>
                    <Table.Cell>
                      {ticket.message ? ticket.message : "No error"}
                    </Table.Cell>
                    <Table.Cell>
                      {ticket.receiptFetched ? "True" : "False"}
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
                          {pushTicketsPage.totalrecords} item
                          {pushTicketsPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {pushTicketsPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={pushTicketsPage.pages}
                          onPageChange={(e, { activePage }) =>
                            setActivePage(activePage)
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

PushTicketsList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default PushTicketsList;
