import React from "react";
import { Grid, Container, Icon, Card } from "semantic-ui-react";
import Footer from "../../components/Footer/Footer";
import logo from "../../images/site-logo.png"; // Tell Webpack this JS file uses this image
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

const Home = () => {
  const { loading, data: { categorieswidget } = {} } = useQuery(
    QUERY_CATEGORIESWIDGET
  );

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <main>
        <section className="homepage-top">
          <div className="logo-container">
            <img src={logo} alt="Logo" />
            <p className="homepage-subhead">
              A fun trivia game that you can play on your own or with friends.
            </p>
          </div>
        </section>
        <section className="homepage-middle">
          <h2>Features</h2>
          <Grid stackable columns={3}>
            <Grid.Column>
              <Container>
                <Card fluid>
                  <Card.Content>
                    <Card.Header>
                      {categorieswidget.totalcategories} Categories
                    </Card.Header>
                    <Card.Description>
                      Matthew is a musician living in Nashville.
                    </Card.Description>
                  </Card.Content>
                </Card>
              </Container>
            </Grid.Column>
            <Grid.Column>
              <Card fluid>
                <Card.Content>
                  <Card.Header>Challenge Your Friends</Card.Header>
                  <Card.Description>
                    Matthew is a musician living in Nashville.
                  </Card.Description>
                </Card.Content>
              </Card>
            </Grid.Column>
            <Grid.Column>
              <Container>
                <Card fluid>
                  <Card.Content>
                    <Card.Header>Track Your Stats</Card.Header>
                    <Card.Description>
                      Matthew is a musician living in Nashville.
                    </Card.Description>
                  </Card.Content>
                </Card>
              </Container>
            </Grid.Column>
          </Grid>
          <h2>Game Modes</h2>

          <Card fluid>
            <Card.Content>
              <Card.Header>Solo</Card.Header>
              <Card.Description>
                Matthew is a musician living in Nashville.
              </Card.Description>
            </Card.Content>
          </Card>

          <Card fluid>
            <Card.Content>
              <Icon circular name="users" />
              <Card.Header>Joust</Card.Header>
              <Card.Description>
                Matthew is a musician living in Nashville.
              </Card.Description>
            </Card.Content>
          </Card>

          <Card fluid>
            <Card.Content>
              <Card.Header>Siege</Card.Header>
              <Card.Description>
                Matthew is a musician living in Nashville.
              </Card.Description>
            </Card.Content>
          </Card>

          <Card fluid>
            <Card.Content>
              <Card.Header>Press Your Luck</Card.Header>
              <Card.Description>
                Matthew is a musician living in Nashville.
              </Card.Description>
            </Card.Content>
          </Card>
        </section>
        <section className="homepage-bottom">
          <Footer />
        </section>
      </main>
    </>
  );
};

const QUERY_CATEGORIESWIDGET = gql`
  query categoriesWidget {
    categorieswidget {
      totalcategories
      unpublishedcategories
    }
  }
`;

export default Home;
