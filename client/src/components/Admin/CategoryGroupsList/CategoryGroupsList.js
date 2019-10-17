import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, Button, Icon, Grid, Pagination } from "semantic-ui-react";
import DeleteCategoryGroupModal from "./DeleteCategoryGroupModal";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYGROUPSPAGE from "../../../apollo/queries/categoryGroupsPage";

const CategoryGroupsList = props => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit
  };

  const { loading, data: { categoryGroupsPage } = {}, fetchMore } = useQuery(
    QUERY_CATEGORYGROUPSPAGE,
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
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Display Text</Table.HeaderCell>
            <Table.HeaderCell>Active</Table.HeaderCell>
            <Table.HeaderCell>Categories</Table.HeaderCell>
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
              {categoryGroupsPage.categorygroups.length ? (
                categoryGroupsPage.categorygroups.map(group => (
                  <Table.Row key={group._id}>
                    <Table.Cell>{group.name}</Table.Cell>
                    <Table.Cell>{group.displaytext}</Table.Cell>
                    <Table.Cell>{group.active ? "Yes" : "No"}</Table.Cell>
                    <Table.Cell>
                      {group.categories.length
                        ? group.categories.map(cat => cat.name).join(", ")
                        : null}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <div>
                        <Button
                          icon
                          size="mini"
                          onClick={() =>
                            history.push(`${match.url}/${group._id}`)
                          }
                        >
                          <Icon name="edit" />
                        </Button>
                        <DeleteCategoryGroupModal
                          categorygroupname={group.name}
                          categorygroupid={group._id}
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
                <Table.HeaderCell colSpan="5">
                  <Grid columns="equal">
                    <Grid.Column width={2}>
                      <div className="tableItemNumbers">
                        <p>
                          {categoryGroupsPage.totalrecords} item
                          {categoryGroupsPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {categoryGroupsPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={categoryGroupsPage.pages}
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

CategoryGroupsList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default CategoryGroupsList;
