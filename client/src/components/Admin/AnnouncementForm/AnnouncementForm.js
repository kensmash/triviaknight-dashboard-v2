import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button, Checkbox } from "semantic-ui-react";
//components
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_ANNOUNCEMENTSPAGE from "../../../apollo/queries/announcementsPage";

const AnnouncementForm = (props) => {
  const initialState = {
    title: "",
    text: "",
    published: false,
  };

  const [submittedAnnouncementTitle, setSubmittedAnnouncementTitle] = useState(
    ""
  );

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    title: "",
    text: "",
    published: "",
  });

  const [upsertAnnouncement] = useMutation(MUTATION_UPSERTANNOUNCEMENT);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { announcement } = props;
      setFields({
        title: announcement.title,
        text: announcement.text,
        published: announcement.published,
      });
    }
  }, [props]);

  const inputChangedHandler = (event) => {
    setFields({ ...fields, [event.target.id]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.id]: "" });
  };

  const publishedCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, published: true });
    } else {
      setFields({ ...fields, published: false });
    }
  };

  const formValidateHandler = (title, text, published) => {
    const errors = {};

    if (title.length < 3)
      errors.title = "Please enter a title of at least three characters.";

    if (text.length < 10)
      errors.text = "Please enter body text of at least ten characters.";

    return errors;
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    const errors = formValidateHandler(
      fields.title,
      fields.text,
      fields.published
    );
    if (Object.keys(errors).length)
      return setFieldErrors(...fieldErrors, ...errors);
    UpsertAnnouncementHandler();
  };

  const UpsertAnnouncementHandler = async () => {
    //add category
    const graphqlResponse = await upsertAnnouncement({
      variables: {
        input: {
          id: props.pageType === "edit" ? props.announcement._id : null,
          title: fields.title,
          text: fields.text,
          published: fields.published,
        },
      },
      refetchQueries: [
        {
          query: QUERY_ANNOUNCEMENTSPAGE,
          variables: {
            offset: 15 * parseInt(1, 10) - 15,
            limit: 15,
          },
        },
      ],
    });
    setSubmittedAnnouncementTitle(
      graphqlResponse.data.upsertannouncement.title
    );
  };

  const clearFormHandler = () => {
    setFields(initialState);
  };

  return (
    <Form>
      {props.pageType === "edit" ? <h3>Edit Announcement</h3> : null}
      <Form.Field required>
        <label>Title</label>
        <input
          placeholder="Enter Announcement title..."
          id="name"
          value={fields.name}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.name !== ""}
          errormessage={fieldErrors.name}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Published"
          checked={fields.published}
          onChange={(event, data) => publishedCheckboxHandler(event, data)}
        />
      </Form.Field>

      <FormSuccessMessage
        reveal={submittedAnnouncementTitle !== ""}
        header={
          props.pageType === "edit"
            ? "Announcement Updated"
            : "Announcement Added"
        }
        content={
          (props.pageType === "edit"
            ? "You've successfully updated"
            : "You've successfully added") +
          " the announcement " +
          submittedAnnouncementTitle +
          "."
        }
      />

      {submittedAnnouncementTitle !== "" ? (
        props.pageType === "edit" ? (
          <Button primary onClick={props.history.goBack}>
            Go Back
          </Button>
        ) : (
          <Button color="blue" onClick={clearFormHandler}>
            Add Another
          </Button>
        )
      ) : (
        <div className="formButtonGroup">
          <Button color="green" onClick={formSubmitHandler}>
            Submit
          </Button>
          {props.pageType === "edit" && (
            <Button color="grey" onClick={props.history.goBack}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </Form>
  );
};

const MUTATION_UPSERTANNOUNCEMENT = gql`
  mutation upsertAnnouncement($input: upsertAnnouncementInput) {
    upsertannouncement(input: $input) {
      _id
      title
      text
      published
    }
  }
`;

AnnouncementForm.propTypes = {
  pageType: PropTypes.string,
  announcement: PropTypes.object,
  history: PropTypes.object,
};

export default AnnouncementForm;
