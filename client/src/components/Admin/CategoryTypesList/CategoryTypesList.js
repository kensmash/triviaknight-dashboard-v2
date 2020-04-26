import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon, Grid, Pagination } from "semantic-ui-react";
import DeleteCategoryTypeModal from "./DeleteCategoryTypeModal";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYTYPESPAGE from "../../../apollo/queries/categoryTypesPage";

const CategoryTypesList = (props) => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit,
    name: "",
    hasgenres: "",
  };

  const { loading, data: { categoryTypesPage } = {}, fetchMore } = useQuery(
    QUERY_CATEGORYTYPESPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network",
    }
  );

  const fetchMoreHandler = (activePage) => {
    setActivePage(activePage);
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
  };

  const { match, history } = props;

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Playable</Table.HeaderCell>
            <Table.HeaderCell>Quest Active</Table.HeaderCell>
            <Table.HeaderCell>Next Quest Active</Table.HeaderCell>
            <Table.HeaderCell>Has Genres</Table.HeaderCell>
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
              {categoryTypesPage.categorytypes.length ? (
                categoryTypesPage.categorytypes.map((type) => (
                  <Table.Row key={type._id}>
                    <Table.Cell>{type.name}</Table.Cell>
                    <Table.Cell>{type.playable ? "Yes" : "No"}</Table.Cell>

                    <Table.Cell>{type.questactive ? "Yes" : "No"}</Table.Cell>
                    <Table.Cell>
                      {type.nextquestactive ? "Yes" : "No"}
                    </Table.Cell>
                    <Table.Cell>{type.hasgenres ? "Yes" : "No"}</Table.Cell>
                    <Table.Cell collapsing>
                      <div>
                        <Button
                          icon
                          size="mini"
                          onClick={() =>
                            history.push(`${match.url}/${type._id}`)
                          }
                        >
                          <Icon name="edit" />
                        </Button>
                        <DeleteCategoryTypeModal
                          categorytypename={type.name}
                          categorytypeid={type._id}
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
                <Table.HeaderCell colSpan="8">
                  <Grid columns="equal">
                    <Grid.Column width={2}>
                      <div className="tableItemNumbers">
                        <p>
                          {categoryTypesPage.totalrecords} item
                          {categoryTypesPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {categoryTypesPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={categoryTypesPage.pages}
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

CategoryTypesList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default CategoryTypesList;
