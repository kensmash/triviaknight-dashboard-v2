import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const PushTicketsWidget = props => (
  <Query query={pushTicketsWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal>
              <Statistic.Value>
                {data.pushticketswidget.ticketswitherrors}
              </Statistic.Value>
              <Statistic.Label>
                Push Ticket Error
                {data.pushticketswidget.ticketswitherrors !== 1 ? "s" : ""}
              </Statistic.Label>
            </Statistic>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/pushtickets")}
            >
              See Push Tickets
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const pushTicketsWidgetQuery = gql`
  query pushticketswidget {
    pushticketswidget {
      ticketswitherrors
    }
  }
`;

PushTicketsWidget.propTypes = {
  history: PropTypes.object
};

export default PushTicketsWidget;
