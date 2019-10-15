import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const QuestionsWidget = props => (
  <Query query={questionWidgetQuery}>
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal size="huge" color="green">
              <Statistic.Value>
                {data.questionswidget.totalquestions}
              </Statistic.Value>
              <Statistic.Label>Questions</Statistic.Label>
            </Statistic>
            <Card.Description>
              {data.questionswidget.unpublishedquestions} unpublished question
              {data.questionswidget.unpublishedquestions !== 1 && "s"}
            </Card.Description>
          </Card.Content>

          <Card.Content extra>
            <div className="ui two buttons">
              <Button
                basic
                color="blue"
                onClick={() => props.history.push("admin/questions")}
              >
                See Questions
              </Button>
              <Button
                basic
                color="green"
                onClick={() => props.history.push("admin/questions/new")}
              >
                Add New Question
              </Button>
            </div>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const questionWidgetQuery = gql`
  query questionswidget {
    questionswidget {
      totalquestions
      unpublishedquestions
    }
  }
`;

QuestionsWidget.propTypes = {
  history: PropTypes.object
};

export default QuestionsWidget;
