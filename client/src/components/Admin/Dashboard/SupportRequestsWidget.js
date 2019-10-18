import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const SupportRequestsWidget = props => (
  <Query query={supportRequestWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal>
              <Statistic.Value>
                {data.supportrequestswidget.openrequests}
              </Statistic.Value>
              <Statistic.Label>
                Open Support Request
                {data.supportrequestswidget.openrequests !== 1 ? "s" : ""}
              </Statistic.Label>
            </Statistic>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/supportrequests")}
            >
              See Support Requests
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const supportRequestWidgetQuery = gql`
  query supportrequestswidget {
    supportrequestswidget {
      openrequests
      newrequests
    }
  }
`;

SupportRequestsWidget.propTypes = {
  history: PropTypes.object
};

export default SupportRequestsWidget;
