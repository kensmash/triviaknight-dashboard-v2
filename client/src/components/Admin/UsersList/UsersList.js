import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table, Grid, Pagination } from "semantic-ui-react";
import format from "date-fns/format";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_USERSPAGE from "../../../apollo/queries/usersPage";

const UsersList = () => {
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(currentActivePage, 10) - limit,
    limit,
  };

  const { loading, data: { userspage } = {}, fetchMore } = useQuery(
    QUERY_USERSPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network",
    }
  );

  useEffect(() => {
    fetchMore({
      variables: {
        offset: limit * parseInt(currentActivePage, 10) - limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
  }, [currentActivePage, limit, fetchMore]);

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Joined</Table.HeaderCell>
            <Table.HeaderCell>Last Active</Table.HeaderCell>
            <Table.HeaderCell>Categories</Table.HeaderCell>
            <Table.HeaderCell>Solo Games</Table.HeaderCell>
            <Table.HeaderCell>Joust Games</Table.HeaderCell>
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
              {userspage.users.length ? (
                userspage.users.map((user) => (
                  <Table.Row key={user._id}>
                    <Table.Cell>{user.name}</Table.Cell>
                    <Table.Cell>
                      {format(
                        new Date(Number(user.createdAt)),
                        "EEEE, LLLL do, yyyy"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {format(
                        new Date(Number(user.updatedAt)),
                        "EEEE, LLLL do, yyyy"
                      )}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      {user.categories.length ? user.categories.length : 0}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      {user.sologames.length ? user.sologames.length : 0}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      {user.joustgames.length ? user.joustgames.length : 0}
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
                          {userspage.totalrecords} item
                          {userspage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {userspage.pages >= 2 ? (
                        <Pagination
                          activePage={currentActivePage}
                          totalPages={userspage.pages}
                          onPageChange={(e, { activePage }) => {
                            setCurrentActivePage(activePage);
                          }}
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

UsersList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default UsersList;
