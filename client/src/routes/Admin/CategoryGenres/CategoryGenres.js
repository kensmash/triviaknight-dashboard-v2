import React, { Fragment } from "react";
import { Grid, Card, Header } from "semantic-ui-react";
import CategoryGenreForm from "../../../components/Admin/CategoryGenreForm/CategoryGenreForm";
import CategoryGenresList from "../../../components/Admin/CategoryGenresList/CategoryGenresList";

const CategoryGenres = ({ history, match }) => (
  <Fragment>
    <Header as="h1">Category Genres</Header>
    <Grid>
      <Grid.Column mobile={16} computer={4}>
        <Card fluid>
          <Card.Content>
            <Card.Header>New Category Genre</Card.Header>
          </Card.Content>
          <Card.Content>
            <CategoryGenreForm />
          </Card.Content>
          <Card.Content extra>
            Genres are associated with Category Types. For instance, Rock,
            Alternative, etc. would be assigned to Music. Science Fiction could
            be assigned to Books, Movies and Television.
          </Card.Content>
        </Card>
      </Grid.Column>
      <Grid.Column mobile={16} computer={12}>
        <CategoryGenresList history={history} match={match} />
      </Grid.Column>
    </Grid>
  </Fragment>
);

export default CategoryGenres;
