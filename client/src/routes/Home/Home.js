import React, { Fragment } from "react";
import Footer from "../../components/Footer/Footer";
import phone from "../../images/phone.png"; // Tell Webpack this JS file uses this image
import logo from "../../images/site-logo.png"; // Tell Webpack this JS file uses this image

const Home = () => (
  <Fragment>
    <section className="homepage-top">
      <div className="bigphone">
        <img src={phone} alt="phone" />
      </div>

      <div className="logo-container">
        <img src={logo} alt="Logo" />
        <p className="homepage-subhead">
          A fun trivia game that you can play on your own or with friends.
        </p>
      </div>
    </section>
    <section className="homepage-middle">
      <div className="bullet-container">
        <p>Over x categories</p>
        <p>Challenge your friends!</p>
        <p>Track your stats</p>
      </div>
    </section>
    <section className="homepage-bottom">
      <Footer />
    </section>
  </Fragment>
);

export default Home;
