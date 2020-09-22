import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const AnnouncementsWidget = (props) => (
  <Query query={announcementsWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal>
              <Statistic.Value>
                {data.announcementsWidget.totalannouncements}
              </Statistic.Value>
              <Statistic.Label>
                Announcement
                {data.announcementsWidget.totalannouncements !== 1 ? "s" : ""}
              </Statistic.Label>
            </Statistic>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/announcements")}
            >
              See Announcements
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const announcementsWidgetQuery = gql`
  query announcementsWidget {
    announcementsWidget {
      totalannouncements
      unpublishedannouncements
    }
  }
`;

AnnouncementsWidget.propTypes = {
  history: PropTypes.object,
};

export default AnnouncementsWidget;
