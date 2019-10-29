import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Table, Grid, Pagination } from "semantic-ui-react";
import DeleteJoustGameModal from "./DeleteJoustGameModal";
import format from "date-fns/format";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_JOUSTGAMEPAGE from "../../../apollo/queries/joustGamePage";

const GamesJoustList = () => {
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(currentActivePage, 10) - limit,
    limit
  };

  const { loading, data: { joustgamepage } = {}, fetchMore } = useQuery(
    QUERY_JOUSTGAMEPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network"
    }
  );

  useEffect(() => {
    fetchMore({
      variables: {
        offset: limit * parseInt(currentActivePage, 10) - limit
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      }
    });
  }, [currentActivePage, limit, fetchMore]);

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Created On</Table.HeaderCell>
            <Table.HeaderCell>Players</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
            <Table.HeaderCell>Last Played</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Game ID</Table.HeaderCell>
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
              {joustgamepage.joustgames.length ? (
                joustgamepage.joustgames.map(game => (
                  <Table.Row key={game._id}>
                    <Table.Cell collapsing>
                      {format(
                        new Date(Number(game.createdAt)),
                        "EEEE, LLLL do, yyyy"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {game.players
                        .map(player => player.player.name)
                        .join(", ")}
                    </Table.Cell>
                    <Table.Cell>{game.category.name}</Table.Cell>
                    <Table.Cell>
                      {format(
                        new Date(Number(game.updatedAt)),
                        "EEEE, LLLL do, yyyy"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {game.gameover ? "Game Over" : "Playing"}
                    </Table.Cell>

                    <Table.Cell collapsing>{game._id}</Table.Cell>

                    <Table.Cell collapsing>
                      <div>
                        <DeleteJoustGameModal
                          joustgameid={game._id}
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
                          {joustgamepage.totalrecords} item
                          {joustgamepage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {joustgamepage.pages >= 2 ? (
                        <Pagination
                          activePage={currentActivePage}
                          totalPages={joustgamepage.pages}
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

GamesJoustList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default GamesJoustList;
