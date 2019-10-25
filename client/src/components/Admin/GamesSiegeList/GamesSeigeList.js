import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Grid, Pagination } from "semantic-ui-react";
import DeleteSiegeGameModal from "./DeleteSiegeGameModal";
import format from "date-fns/format";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_SIEGEGAMEPAGE from "../../../apollo/queries/siegeGamePage";

const GamesSiegeList = () => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit
  };

  const { loading, data: { siegegamepage } = {}, fetchMore } = useQuery(
    QUERY_SIEGEGAMEPAGE,
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

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Created On</Table.HeaderCell>
            <Table.HeaderCell>Players</Table.HeaderCell>
            <Table.HeaderCell>Topic</Table.HeaderCell>
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
              {siegegamepage.siegegames.length ? (
                siegegamepage.siegegames.map(game => (
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
                    <Table.Cell>{game.topic}</Table.Cell>
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
                        <DeleteSiegeGameModal
                          siegegameid={game._id}
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
                          {siegegamepage.totalrecords} item
                          {siegegamepage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {siegegamepage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={siegegamepage.pages}
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

GamesSiegeList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default GamesSiegeList;
