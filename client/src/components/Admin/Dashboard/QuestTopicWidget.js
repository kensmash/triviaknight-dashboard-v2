import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Card, Statistic } from "semantic-ui-react";

const QuestTopicWidget = (props) => (
  <Query query={nextQuestTopicQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content
            header={`Next Quest topic:
                ${
                  data.nextquesttopic.topic
                    ? data.nextquesttopic.topic
                    : " none chosen yet"
                }`}
          />
          <Card.Content
            description={`${
              data.nextquesttopic.type
                ? data.nextquesttopic.type
                : "If no topic is chosen before Sunday at midnight, the server will select one automatically from categories."
            }`}
          />
        </Card>
      );
    }}
  </Query>
);

const nextQuestTopicQuery = gql`
  query nextQuestTopic {
    nextquesttopic {
      id
      type
      topic
    }
  }
`;

QuestTopicWidget.propTypes = {
  history: PropTypes.object,
};

export default QuestTopicWidget;
