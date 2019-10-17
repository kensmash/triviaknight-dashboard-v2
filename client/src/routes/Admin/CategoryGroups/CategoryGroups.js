import React, { Fragment } from "react";
import { Grid, Card, Header } from "semantic-ui-react";
import CategoryGroupForm from "../../../components/Admin/CategoryGroupForm/CategoryGroupForm";
import CategoryGroupsList from "../../../components/Admin/CategoryGroupsList/CategoryGroupsList";

const CategoryGroups = ({ history, match }) => (
  <Fragment>
    <Header as="h1">Category Groups</Header>
    <Grid>
      <Grid.Column mobile={16} computer={4}>
        <Card fluid>
          <Card.Content>
            <Card.Header>New Category Group</Card.Header>
          </Card.Content>
          <Card.Content>
            <CategoryGroupForm />
          </Card.Content>
          <Card.Content extra>
            Category Groups are used to display and promote related categories,
            for example categories for Halloween or Christmas.
          </Card.Content>
        </Card>
      </Grid.Column>
      <Grid.Column mobile={16} computer={12}>
        <CategoryGroupsList history={history} match={match} />
      </Grid.Column>
    </Grid>
  </Fragment>
);

export default CategoryGroups;
