import React from "react";
import { Grid, Card, Header } from "semantic-ui-react";
import AnnouncementForm from "../../../components/Admin/AnnouncementForm/AnnouncementForm";
import AnnouncementsList from "../../../components/Admin/AnnouncementsList/AnnouncementsList";

const Announcements = ({ history, match }) => (
  <>
    <Header as="h1">Announcements</Header>
    <Grid>
      <Grid.Column mobile={16} computer={4}>
        <Card fluid>
          <Card.Content>
            <Card.Header>New Announcement</Card.Header>
          </Card.Content>
          <Card.Content>
            <AnnouncementForm />
          </Card.Content>
          <Card.Content extra>Make yo announcement</Card.Content>
        </Card>
      </Grid.Column>
      <Grid.Column mobile={16} computer={12}>
        <AnnouncementsList history={history} match={match} />
      </Grid.Column>
    </Grid>
  </>
);

export default Announcements;
