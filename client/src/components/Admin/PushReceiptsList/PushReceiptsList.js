import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table, Grid, Pagination } from "semantic-ui-react";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_PUSHRECEIPTSPAGE from "../../../apollo/queries/pushReceiptsPage";

const PushReceiptsList = () => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit,
  };

  const { loading, data: { pushReceiptsPage } = {}, fetchMore } = useQuery(
    QUERY_PUSHRECEIPTSPAGE,
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
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Error</Table.HeaderCell>
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
              {pushReceiptsPage.receipts.length ? (
                pushReceiptsPage.receipts.map((receipt) => (
                  <Table.Row key={receipt._id}>
                    <Table.Cell>{receipt.id ? receipt.id : "no id"}</Table.Cell>
                    <Table.Cell>
                      {receipt.status ? receipt.status : receipt.code}
                    </Table.Cell>
                    <Table.Cell>
                      {receipt.details ? receipt.details.error : "No error"}
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
                          {pushReceiptsPage.totalrecords} item
                          {pushReceiptsPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {pushReceiptsPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={pushReceiptsPage.pages}
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

PushReceiptsList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default PushReceiptsList;
