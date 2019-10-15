import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Button, Card, Statistic } from "semantic-ui-react";

const CategoriesWidget = props => (
  <Query query={categoryWidgetQuery} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Card>
          <Card.Content>
            <Statistic horizontal size="huge" color="green">
              <Statistic.Value>
                {data.categorieswidget.totalcategories}
              </Statistic.Value>
              <Statistic.Label>Categories</Statistic.Label>
            </Statistic>
            <Card.Description>
              {data.categorieswidget.unpublishedcategories} unpublished
              {data.categorieswidget.unpublishedcategories === 1
                ? " category"
                : " categories"}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              fluid
              color="blue"
              onClick={() => props.history.push("admin/categories")}
            >
              See Categories
            </Button>
          </Card.Content>
        </Card>
      );
    }}
  </Query>
);

const categoryWidgetQuery = gql`
  query categoriesWidget {
    categorieswidget {
      totalcategories
      unpublishedcategories
    }
  }
`;

CategoriesWidget.propTypes = {
  history: PropTypes.object
};

export default CategoriesWidget;
