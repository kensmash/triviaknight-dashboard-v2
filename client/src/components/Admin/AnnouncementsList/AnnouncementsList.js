import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table, Button, Icon, Grid, Pagination } from "semantic-ui-react";
import DeleteAnnouncementModal from "./DeleteAnnouncementModal";
import format from "date-fns/format";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_ANNOUNCEMENTSPAGE from "../../../apollo/queries/announcementsPage";

const AnnouncementsList = (props) => {
  const [activePage, setActivePage] = useState(1);
  const [limit] = useState(15);

  const variables = {
    offset: limit * parseInt(activePage, 10) - limit,
    limit,
  };

  const { loading, data: { announcementsPage } = {}, fetchMore } = useQuery(
    QUERY_ANNOUNCEMENTSPAGE,
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
            <Table.HeaderCell>Headline</Table.HeaderCell>
            <Table.HeaderCell>Text</Table.HeaderCell>
            <Table.HeaderCell>Last Updated</Table.HeaderCell>
            <Table.HeaderCell>Published</Table.HeaderCell>
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
              {announcementsPage.announcements.length ? (
                announcementsPage.announcements.map((ann) => (
                  <Table.Row key={ann._id}>
                    <Table.Cell>
                      <Link to={`${match.url}/${ann._id}`}>{ann.headline}</Link>
                    </Table.Cell>
                    <Table.Cell>{ann.text}</Table.Cell>
                    <Table.Cell>
                      {format(
                        new Date(Number(ann.updatedAt)),
                        "EEEE, LLLL do, yyyy"
                      )}
                    </Table.Cell>
                    <Table.Cell>{ann.published ? "Yes" : "No"}</Table.Cell>
                    <Table.Cell collapsing>
                      <div>
                        <Button
                          icon
                          size="mini"
                          onClick={() =>
                            history.push(`${match.url}/${ann._id}`)
                          }
                        >
                          <Icon name="edit" />
                        </Button>
                        <DeleteAnnouncementModal
                          announcementid={ann._id}
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
                          {announcementsPage.totalrecords} item
                          {announcementsPage.totalrecords !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Grid.Column>

                    <Grid.Column className="tablePaginationColumn">
                      {announcementsPage.pages >= 2 ? (
                        <Pagination
                          activePage={activePage}
                          totalPages={announcementsPage.pages}
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

AnnouncementsList.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default AnnouncementsList;
