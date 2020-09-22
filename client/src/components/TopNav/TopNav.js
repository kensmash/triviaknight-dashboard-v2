import React, { useState } from "react";
import { gql } from "apollo-boost";
import { Link } from "react-router-dom";
import { Menu, Dropdown } from "semantic-ui-react";
//graphql
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import QUERY_CURRENTUSER from "../../apollo/queries/currentUser";

const TopNav = (props) => {
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
    <>
      <Menu inverted stackable>
        <Menu.Item
          as={Link}
          to={"/"}
          name="Trivia Knight"
          active={activeItem === "home"}
          onClick={handleItemClick}
        />

        <Menu.Menu position="right">
          {currentUser && currentUser.isAdmin ? (
            <>
              <Menu.Item as={Link} to={"/admin"} name="dashboard" />
              <Dropdown item text="Questions">
                <Dropdown.Menu>
                  <Dropdown.Item
                    as={Link}
                    to={"/admin/questions"}
                    active={activeItem === "questions"}
                  >
                    All Questions
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to={"/admin/questions/new"}>
                    New Question
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"/admin/questions/reports"}>
                    Question Reports
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown item text="Categories">
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={"/admin/categories"}>
                    Categories
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to={"/admin/categorytypes"}>
                    Category Types
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"/admin/categorygenres"}>
                    Category Genres
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"/admin/categorygroups"}>
                    Category Groups
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown item text="Games">
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={"/admin/joustgames"}>
                    Joust Games
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to={"/admin/siegegames"}>
                    Siege Games
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Menu.Item as={Link} to={"/admin/users"} name="Users" />
            </>
          ) : null}
          {currentUser && <Menu.Item name="logout" onClick={logoutHandler} />}
        </Menu.Menu>
      </Menu>
    </>
  );
};

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export default TopNav;
