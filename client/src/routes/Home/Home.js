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
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column width={12}>
                <p className="homepage-subhead text-shadow">
                  A fun trivia game that you can play on your own or with
                  friends. Over 150 categories and more than 10,000 questions!
                  Challenge your friends and follow your progress with
                  statistics and leaderboards.
                </p>
              </Grid.Column>
              <Grid.Column width={4}>
                <Image
                  src={appStore}
                  as="a"
                  href="https://apps.apple.com/us/app/id1449601925"
                  target="_blank"
                  className="appstore-button"
                />
                <Image
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
              <Card.Header>Solo</Card.Header>

              <Card.Description>
                See how you do in general categories such as Movies, Television
                and Music.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Card.Header>Joust</Card.Header>

              <Card.Description>
                Challenge a friend in any category.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card fluid>
            <Card.Content>
              <Card.Header>Quest</Card.Header>

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
