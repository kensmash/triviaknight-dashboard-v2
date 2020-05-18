import React from "react";
import { Card } from "semantic-ui-react";
import Footer from "../../components/Footer/Footer";
import logo from "../../images/site-logo.png"; // Tell Webpack this JS file uses this image

const Home = () => {
  return (
    <>
      <main>
        <section className="homepage-top">
          <div className="logo-container">
            <img src={logo} alt="Logo" />
            <p className="homepage-subhead">
              A fun trivia game that you can play on your own or with friends.
              Over 150 categories and nearly 10,000 questions! Challenge your
              friends and track your stats.
            </p>
          </div>
        </section>
        <section className="homepage-middle">
          <h2>Game Modes</h2>

          <Card.Group centered stackable>
            <Card>
              <Card.Content>
                <Card.Header>Solo</Card.Header>

                <Card.Description>
                  See how you do in general categories such as Movies,
                  Television and Music.
                </Card.Description>
              </Card.Content>
            </Card>
            <Card>
              <Card.Content>
                <Card.Header>Joust</Card.Header>

                <Card.Description>
                  Challenge a friend in any category!
                </Card.Description>
              </Card.Content>
            </Card>
            <Card>
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
    </>
  );
};

export default Home;
