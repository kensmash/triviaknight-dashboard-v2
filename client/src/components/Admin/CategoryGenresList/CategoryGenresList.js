import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Input,
  Table,
  Button,
  Icon,
  Grid,
  Pagination,
} from "semantic-ui-react";
//components
import CatTypeSelect from "../CatTypeSelect/CatTypeSelect";
import DeleteCategoryGenreModal from "./DeleteCategoryGenreModal";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORYGENRESPAGE from "../../../apollo/queries/categoryGenresPage";
import QUERY_CLIENTCATEGORYGENRESSEARCH from "../../../apollo/queries/client-categoryGenreSearchCriteria";

const CategoryGenresList = (props) => {
  const [name, setName] = useState("");

  const { data: { categoryGenreSearchCriteria } = {} } = useQuery(
    QUERY_CLIENTCATEGORYGENRESSEARCH
  );

  const variables = {
    offset:
      categoryGenreSearchCriteria.limit *
        parseInt(categoryGenreSearchCriteria.activePage, 10) -
      categoryGenreSearchCriteria.limit,
    limit: categoryGenreSearchCriteria.limit,
    name: categoryGenreSearchCriteria.name,
    categorytypes: categoryGenreSearchCriteria.types.length
      ? categoryGenreSearchCriteria.types.map((item) => item.value)
      : [],
  };

  const { loading, data: { categoryGenresPage } = {}, fetchMore } = useQuery(
    QUERY_CATEGORYGENRESPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network",
    }
  );

  const [updateCategoryGenreSearch] = useMutation(
    MUTATION_UPDATECATEGORYGENRESEARCH
  );

  const genreNameChangeHandler = (event) => {
    setName(event.target.value);
  };

  const genreNameSearchHandler = () => {
    updateCategoryGenreSearch({
      variables: {
        ...categoryGenreSearchCriteria,
        name,
      },
    });
  };

  const clearNameSearchHandler = () => {
    updateCategoryGenreSearch({
      variables: {
        ...categoryGenreSearchCriteria,
        name: "",
      },
    });
    setName("");
  };

  const catTypesSelectHandler = (_event, data) => {
    updateCategoryGenreSearch({
      variables: {
        ...categoryGenreSearchCriteria,
        types: data.value,
      },
    });
  };

  const { match, history } = props;

  return (
    <>
      <Grid columns="equal" className="searchCriteria">
        <Grid.Row>
          <Grid.Column>
            <Form>
              <Form.Field>
                <Input type="text" placeholder="Search..." action>
                  <input
                    placeholder="Search by Name"
                    value={name}
                    onChange={(event) => genreNameChangeHandler(event)}
                  />
                  <Button icon="search" onClick={genreNameSearchHandler} />
                  {categoryGenreSearchCriteria.name !== "" ? (
                    <Button icon="x" onClick={clearNameSearchHandler} />
                  ) : null}
                </Input>
              </Form.Field>
            </Form>
          </Grid.Column>
          <Grid.Column className="tablePerPageColumn">
            <CatTypeSelect
              type="genre"
              value={categoryGenreSearchCriteria.types}
              placeholder="Filter By Category Types"
              catTypeSelectHandler={(event, data) =>
                catTypesSelectHandler(event, data)
              }
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>

            <Table.HeaderCell>Quest Active</Table.HeaderCell>
            <Table.HeaderCell>Next Quest Active</Table.HeaderCell>
            <Table.HeaderCell>Category Types</Table.HeaderCell>
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
              {categoryGenresPage.categorygenres.length ? (
                categoryGenresPage.categorygenres.map((genre) => (
                  <Table.Row key={genre._id}>
                    <Table.Cell>{genre.name}</Table.Cell>

                    <Table.Cell>{genre.questactive ? "Yes" : "No"}</Table.Cell>
                    <Table.Cell>
                      {genre.nextquestactive ? "Yes" : "No"}
                    </Table.Cell>
                    <Table.Cell>
                      {genre.categorytypes.length
                        ? genre.categorytypes
                            .map((type) => type.name)
                            .join(", ")
                        : null}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <div>
                        <Button
                          icon
                          size="mini"
                          onClick={() =>
                            history.push(`${match.url}/${genre._id}`)
                          }
                        >
                          <Icon name="edit" />
                        </Button>
                        <DeleteCategoryGenreModal
                          categorygenrename={genre.name}
                          categorygenreid={genre._id}
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
                <Table.HeaderCell colSpan="6">
                  <Grid columns="equal">
                    <Grid.Column width={2}>
                      <div className="tableItemNumbers">
                        <p>
                          {categoryGenresPage.totalrecords} item
                          {categoryGenresPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {categoryGenresPage.pages >= 2 ? (
                        <Pagination
                          activePage={categoryGenreSearchCriteria.activePage}
                          totalPages={categoryGenresPage.pages}
                          onPageChange={(e, { activePage }) =>
                            updateCategoryGenreSearch({
                              variables: {
                                ...categoryGenreSearchCriteria,
                                activePage,
                              },
                            }).then(() =>
                              fetchMore({
                                variables: {
                                  offset:
                                    categoryGenreSearchCriteria.limit *
                                      parseInt(activePage, 10) -
                                    categoryGenreSearchCriteria.limit,
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

const MUTATION_UPDATECATEGORYGENRESEARCH = gql`
  mutation updateCategoryGenreSearch(
    $activePage: activePage
    $limit: Int
    $name: String
    $types: [ID]
  ) {
    updateCategoryGenreSearch(
      activePage: $activePage
      limit: $limit
      name: $name
      types: $types
    ) @client {
      activePage
      limit
      name
      types
    }
  }
`;

CategoryGenresList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default CategoryGenresList;
