import React, { useState } from "react";
import { gql } from "apollo-boost";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import FormErrorMessage from "../../components/FormMessage/FormErrorMessage";
//graphql
import { useMutation, useApolloClient } from "@apollo/react-hooks";

const Login = (props) => {
  const [fields, setFields] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  const [logIn] = useMutation(MUTATION_LOGIN);
  const client = useApolloClient();

  const inputChangedHandler = (event) => {
    setFields({ ...fields, [event.target.id]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.id]: "" });
  };

  const formValidateHandler = () => {
    const { email, password } = fields;
    const errors = {};
    if (email.length < 2) errors.email = "Please enter a valid email address.";
    if (password.length < 8)
      errors.password = "Please enter a password of at least eight characters.";
    return errors;
  };

  const formSubmitHandler = () => {
    const { email, password } = fields;
    const fieldErrors = formValidateHandler(email, password);
    if (Object.keys(fieldErrors).length) return setFieldErrors({ fieldErrors });
    loginHandler();
  };

  const loginHandler = async () => {
    const { email, password } = fields;
    const response = await logIn({
      variables: { email, password, access: "" },
    });

    const { payload, error } = response.data.login;

    if (payload) {
      await client.resetStore();
      if (payload.user.isAdmin) {
        return props.history.push("/admin");
      }
      props.history.push("/");
    } else {
      setFieldErrors({ ...fieldErrors, [error.field]: error.msg });
    }
  };

  return (
    <Grid textAlign="center" style={{ height: "70%" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" color="teal" textAlign="center">
          Log in to your account
        </Header>
        <Form>
          <Segment>
            <Form.Field>
              <label>Email</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                value={fields.email}
                onChange={(event) => inputChangedHandler(event)}
              />
              <FormErrorMessage
                reveal={fieldErrors.email !== ""}
                errormessage={fieldErrors.email}
              />
            </Form.Field>
            <Form.Field>
              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                value={fields.password}
                onChange={(event) => inputChangedHandler(event)}
              />
              <FormErrorMessage
                reveal={fieldErrors.password !== ""}
                errormessage={fieldErrors.password}
              />
            </Form.Field>
            <Button
              type="submit"
              onClick={(event) => {
                event.preventDefault();
                formSubmitHandler();
              }}
            >
              Submit
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

const MUTATION_LOGIN = gql`
  mutation login($email: String!, $password: String!, $access: String!) {
    login(email: $email, password: $password, access: $access) {
      payload {
        user {
          _id
          name
          isAdmin
        }
        sessionID
      }
      error {
        field
        msg
      }
    }
  }
`;

export default Login;
