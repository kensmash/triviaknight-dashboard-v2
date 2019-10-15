import React, { useState } from "react";
import PropTypes from "prop-types";
import { gql } from "apollo-boost";
import { Link } from "react-router-dom";
import { Menu, Dropdown } from "semantic-ui-react";
//graphql
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
//queryhelpers
import QUERY_CURRENTUSER from "../../queries/currentUser";

const TopNav = props => {
  const [activeItem, setActiveItem] = useState("");

  const { data: { currentUser } = {} } = useQuery(QUERY_CURRENTUSER);

  const [logOut] = useMutation(LOGOUT_MUTATION);

  const handleItemClick = (_e, { name }) => setActiveItem(name);

  const client = useApolloClient();

  const logoutHandler = async () => {
    await logOut();
    await client.resetStore();
    props.history.push("/login");
  };

  return (
    <Fragment>
      <Menu inverted>
        <Menu.Item
          as={Link}
          to={"/"}
          name="Trivia Knight"
          active={activeItem === "home"}
          onClick={handleItemClick}
        />

        <Menu.Menu position="right">
          {props.currentUser && props.currentUser.isAdmin ? (
            <Fragment>
              <Menu.Item as={Link} to={"/admin"} name="dashboard" />
              <Dropdown item text="Questions">
                <Dropdown.Menu>
                  <Dropdown.Item
                    as={Link}
                    to={"/questions"}
                    active={activeItem === "questions"}
                  >
                    All Questions
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to={"/questions/new"}>
                    New Question
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"/questions/reports"}>
                    Question Reports
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown item text="Categories">
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={"categories"}>
                    Categories
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to={"categorytypes"}>
                    Category Types
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"categorygenres"}>
                    Category Genres
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"categorygroups"}>
                    Category Groups
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown item text="Games">
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={"joustgames"}>
                    Joust Games
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"siegegames"}>
                    Siege Games
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Menu.Item as={Link} to={"users"} name="Users" />
            </Fragment>
          ) : null}
          {currentUser ? (
            <Menu.Item name="logout" onClick={logoutHandler} />
          ) : (
            <Menu.Item as={Link} to="/login" name="login" />
          )}
        </Menu.Menu>
      </Menu>
    </Fragment>
  );
};

TopNav.propTypes = {
  currentUser: PropTypes.object
};

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export default TopNav;
