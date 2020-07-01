import React from "react";
import { Image, Card, Container, Grid } from "semantic-ui-react";
import Footer from "../../components/Footer/Footer";
import logo from "../../images/site-logo.png"; // Tell Webpack this JS file uses this image

const googlePlay = require("../../images/button-googleplay.png");
const appStore = require("../../images/button-appstore.png");

const Home = () => {
  return (
    <main className="homepage-container">
      <section className="homepage-top">
        <div className="logo-container">
          <img src={logo} alt="Logo" />
        </div>
        <div className="content-container">
          <Grid stackable columns={2}>
            <Grid.Row>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <p className="homepage-subhead text-shadow">
                  A fun trivia game that you can play on your own or with
                  friends. Over 150 categories and more than 10,000 questions!
                  Challenge your friends and follow your progress with
                  statistics and leaderboards.
                </p>
              </Grid.Column>
              <Grid.Column
                mobile={16}
                tablet={16}
                computer={4}
                style={{ paddingTop: 10 }}
              >
                <Image
                  src={appStore}
                  fluid
                  as="a"
                  href="https://apps.apple.com/us/app/id1449601925"
                  target="_blank"
                  className="appstore-button"
                />

                <Image
                  fluid
                  src={googlePlay}
                  as="a"
                  href="https://play.google.com/store/apps/details?id=trivia.knight.android"
                  target="_blank"
                  className="appstore-button"
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <h2 className="text-shadow">Game Modes</h2>
        </div>
      </section>
      <section className="homepage-middle content-container">
        <Card.Group itemsPerRow={3} stackable={true} doubling={true}>
          <Card fluid>
            <Card.Content>
              <Image
                circular
                floated="left"
                size="mini"
                src={require("../../images/icon-solo.png")}
              />
              <Card.Header>Solo</Card.Header>
              <Card.Meta>Single Player</Card.Meta>
              <Card.Description>
                Test your knowledge in topics such as Movies, Television and
                Music.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Image
                circular
                floated="left"
                size="mini"
                src={require("../../images/icon-joust.png")}
              />
              <Card.Header>Joust</Card.Header>
              <Card.Meta>Two Players</Card.Meta>
              <Card.Description>
                Challenge a friend in any category.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Image
                circular
                floated="left"
                size="mini"
                src={require("../../images/icon-quest.png")}
              />
              <Card.Header>Quest</Card.Header>
              <Card.Meta>Single Player Daily</Card.Meta>
              <Card.Description>
                Play once a day in a weekly topic. Correct answers earn gems!
              </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </section>
      <section className="homepage-bottom">
        <Footer />
      </section>
    </main>
  );
};

export default Home;
