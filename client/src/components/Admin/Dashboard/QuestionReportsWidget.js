import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const QuestionReportsWidget = props => (
  <Query query={questionReportsWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal>
              <Statistic.Value>
                {data.questionreportswidget.totalreports}
              </Statistic.Value>
              <Statistic.Label>
                Question Report{data.questionreportswidget.totalreports !== 1
                  ? "s"
                  : ""}
              </Statistic.Label>
            </Statistic>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/questions/reports")}
            >
              See Question Reports
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const questionReportsWidgetQuery = gql`
  query questionReportsWidget {
    questionreportswidget {
      totalreports
    }
  }
`;

QuestionReportsWidget.propTypes = {
  history: PropTypes.object
};

export default QuestionReportsWidget;
