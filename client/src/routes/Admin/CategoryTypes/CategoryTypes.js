import React, { Fragment } from "react";
import { Grid, Card, Header } from "semantic-ui-react";
import CategoryTypeForm from "../../../components/Admin/CategoryTypeForm/CategoryTypeForm";
import CategoryTypesList from "../../../components/Admin/CategoryTypesList/CategoryTypesList";

const CategoryTypes = ({ history, match }) => (
  <Fragment>
    <Header as="h1">Category Types</Header>
    <Grid>
      <Grid.Column mobile={16} computer={4}>
        <Card fluid>
          <Card.Content>
            <Card.Header>New Category Type</Card.Header>
          </Card.Content>
          <Card.Content>
            <CategoryTypeForm />
          </Card.Content>
          <Card.Content extra>
            Has Genres should be checked if the Category Type will have genres
            associated with it (for example, Music or Movies). If there are no
            genres for the category type (for example, General Knowledge or
            Cooking), leave the box unchecked.
          </Card.Content>
        </Card>
      </Grid.Column>
      <Grid.Column mobile={16} computer={12}>
        <CategoryTypesList history={history} match={match} />
      </Grid.Column>
    </Grid>
  </Fragment>
);

export default CategoryTypes;
