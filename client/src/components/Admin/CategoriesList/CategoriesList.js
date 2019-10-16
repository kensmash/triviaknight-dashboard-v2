import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Icon,
  Grid,
  Label,
  Pagination
} from "semantic-ui-react";
//components
import CatGameTypeSelect from "../CatGameTypeSelect/CatGameTypeSelect";
import CatTypeSelect from "../CatTypeSelect/CatTypeSelect";
import CatGenreSelect from "../CatGenreSelect/CatGenreSelect";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORIESPAGE from "../../../apollo/queries/categoriesPage";
import QUERY_CLIENTCATEGORYSEARCH from "../../../apollo/queries/client-categorySearchCriteria";

const CategoriesList = props => {
  const { data: { categorySearchCriteria } = {} } = useQuery(
    QUERY_CLIENTCATEGORYSEARCH
  );

  const variables = {
    input: {
      offset:
        categorySearchCriteria.limit *
          parseInt(categorySearchCriteria.activePage, 10) -
        categorySearchCriteria.limit,
      limit: categorySearchCriteria.limit,
      name: categorySearchCriteria.name,
      type: categorySearchCriteria.type,
      genres: categorySearchCriteria.genres,
      partycategory: categorySearchCriteria.partycategory === "true"
    }
  };

  const { loading, data: { categoriespage } = {}, fetchMore } = useQuery(
    QUERY_CATEGORIESPAGE,
    {
      variables,
      fetchPolicy: "cache-and-network",
      onCompleted: data => {
        //change currently selected page when no records for page greater than 1
        if (
          !data.categoriespage.categories.length &&
          categorySearchCriteria.activePage > 1
        ) {
          props.updateCategorySearch({
            variables: {
              ...categorySearchCriteria,
              activePage: 1
            }
          });
        }
      }
    }
  );

  const [updateCategorySearch] = useMutation(MUTATION_UPDATECATEGORYSEARCH);

  const catTypeSelectHandler = (_e, data) => {
    updateCategorySearch({
      variables: {
        ...categorySearchCriteria,
        type: data.value === "" ? null : data.value
      }
    });
  };

  const catGameTypeSelectHandler = (_e, data) => {
    updateCategorySearch({
      variables: {
        ...categorySearchCriteria,
        partycategory: data.value === "" ? null : data.value
      }
    });
  };

  const catGenreSelectHandler = (_e, data) => {
    console.log(data.value);
    updateCategorySearch({
      variables: {
        ...categorySearchCriteria,
        genres: data.value
      }
    });
  };

  const { pages, totalrecords, categories } = categoriespage;
  const { match, history } = props;

  return (
    <>
      <Grid columns="equal" className="searchCriteria">
        <Grid.Row>
          <Grid.Column>
            <CatGameTypeSelect
              value={categorySearchCriteria.partycategory}
              placeholder="Filter By Game Type"
              gameTypeSelectHandler={(event, data) =>
                catGameTypeSelectHandler(event, data)
              }
            />
          </Grid.Column>
          <Grid.Column className="tablePerPageColumn">
            <CatTypeSelect
              value={categorySearchCriteria.type}
              placeholder="Filter By Type"
              catTypeSelectHandler={(event, data) =>
                catTypeSelectHandler(event, data)
              }
            />
          </Grid.Column>
          <Grid.Column className="tablePerPageColumn">
            <CatGenreSelect
              value={categorySearchCriteria.genres}
              categorytype={categorySearchCriteria.type}
              placeholder="Filter By Genres"
              catGenreSelectHandler={(event, data) =>
                catGenreSelectHandler(event, data)
              }
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Joust Only</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Genres</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Row>
              <Table.Cell>Loading...</Table.Cell>
            </Table.Row>
          ) : (
            <>
              {categories.length ? (
                categories.map(cat => (
                  <Table.Row key={cat._id}>
                    <Table.Cell>
                      {cat.partycategory && (
                        <Label as="a" color="orange" horizontal>
                          Party
                        </Label>
                      )}
                      {cat.showasnew && (
                        <Label as="a" color="teal" horizontal>
                          New
                        </Label>
                      )}
                      {cat.showaspopular && (
                        <Label as="a" color="blue" horizontal>
                          Popular
                        </Label>
                      )}
                      <Link to={`${match.url}/${cat._id}`}>{cat.name}</Link>
                    </Table.Cell>
                    <Table.Cell className="publishedstatuscell">
                      {cat.published ? "Published" : "Draft"}
                    </Table.Cell>

                    <Table.Cell className="publishedstatuscell">
                      {cat.joustexclusive ? "Yes" : "No"}
                    </Table.Cell>

                    <Table.Cell>{cat.type && cat.type.name}</Table.Cell>

                    <Table.Cell>
                      {cat.genres.length
                        ? cat.genres.map(genre => genre.name).join(", ")
                        : null}
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <Button
                        icon
                        size="mini"
                        onClick={() => history.push(`${match.url}/${cat._id}`)}
                      >
                        <Icon name="edit" />
                      </Button>
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
            </>
          )}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="6">
              <Grid columns="equal">
                <Grid.Column width={2}>
                  <div className="tableItemNumbers">
                    <p>
                      {totalrecords} item{totalrecords !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Grid.Column>

                <Grid.Column className="tablePaginationColumn">
                  {pages >= 2 ? (
                    <Pagination
                      activePage={categorySearchCriteria.activePage}
                      totalPages={pages}
                      onPageChange={(e, { activePage }) =>
                        props
                          .updateCategorySearch({
                            variables: {
                              ...categorySearchCriteria,
                              activePage
                            }
                          })
                          .then(() =>
                            fetchMore({
                              variables: {
                                input: {
                                  ...variables.input,
                                  offset:
                                    categorySearchCriteria.limit *
                                      parseInt(activePage, 10) -
                                    categorySearchCriteria.limit
                                }
                              },
                              updateQuery: (prev, { fetchMoreResult }) => {
                                if (!fetchMoreResult) return prev;
                                return fetchMoreResult;
                              }
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
      </Table>
    </>
  );
};

const MUTATION_UPDATECATEGORYSEARCH = gql`
  mutation updateCategorySearch(
    $activePage: activePage
    $limit: Int
    $name: String
    $type: ID
    $genres: [ID]
    $partycategory: Boolean
  ) {
    updateCategorySearch(
      activePage: $activePage
      limit: $limit
      name: $name
      type: $type
      genres: $genres
      partycategory: $partycategory
    ) @client {
      activePage
      limit
      type
      genres
      partycategory
    }
  }
`;

CategoriesList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default CategoriesList;
