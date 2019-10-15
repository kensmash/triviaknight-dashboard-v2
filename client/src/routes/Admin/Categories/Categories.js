import React from "react";
import { Grid, Card, Header, Form } from "semantic-ui-react";
import CategoryForm from "../../../components/Admin/CategoryForm/CategoryForm";
import CategoriesList from "../../../components/Admin/CategoriesList/CategoriesList";

const Categories = ({ history, match }) => (
  <>
    <Header as="h1">Categories</Header>
    <Grid>
      <Grid.Column mobile={16} computer={4}>
        <Card fluid>
          <Card.Content>
            <Card.Header>New Category</Card.Header>
          </Card.Content>
          <Card.Content>
            <Form>
              <CategoryForm />
            </Form>
          </Card.Content>
          <Card.Content extra>
            Categories must have a name, a type (for example, Movies, Music,
            etc.) and a brief description. Categories will not be available in a
            game unless they are published.
          </Card.Content>
        </Card>
      </Grid.Column>
      <Grid.Column mobile={16} computer={12}>
        <CategoriesList history={history} match={match} />
      </Grid.Column>
    </Grid>
  </>
);

export default Categories;
