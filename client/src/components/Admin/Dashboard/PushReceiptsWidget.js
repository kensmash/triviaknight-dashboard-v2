import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const PushReceiptsWidget = props => (
  <Query query={pushReceiptsWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal>
              <Statistic.Value>
                {data.pushreceiptswidget.receiptswitherrors}
              </Statistic.Value>
              <Statistic.Label>
                Push Receipt Error
                {data.pushreceiptswidget.receiptswitherrors !== 1 ? "s" : ""}
              </Statistic.Label>
            </Statistic>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/pushreceipts")}
            >
              See Push Receipts
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const pushReceiptsWidgetQuery = gql`
  query pushreceiptswidget {
    pushreceiptswidget {
      receiptswitherrors
    }
  }
`;

PushReceiptsWidget.propTypes = {
  history: PropTypes.object
};

export default PushReceiptsWidget;
