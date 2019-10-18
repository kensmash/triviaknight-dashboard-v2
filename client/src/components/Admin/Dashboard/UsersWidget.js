import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const UsersWidget = props => (
  <Query query={userWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal size="huge" color="green">
              <Statistic.Value>{data.userwidget.totalusers}</Statistic.Value>
              <Statistic.Label>Users</Statistic.Label>
            </Statistic>
            <Card.Description>
              {data.userwidget.newusers} joined in the last 30 days
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/users")}
            >
              See Users
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const userWidgetQuery = gql`
  query userWidget {
    userwidget {
      totalusers
      newusers
    }
  }
`;

export default UsersWidget;
