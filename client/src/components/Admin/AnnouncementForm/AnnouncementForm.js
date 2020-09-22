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
    headline: "",
    text: "",
    published: false,
  };

  const [
    submittedAnnouncementHeadline,
    setSubmittedAnnouncementHeadline,
  ] = useState("");

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    headline: "",
    text: "",
    published: false,
  });

  const [upsertAnnouncement] = useMutation(MUTATION_UPSERTANNOUNCEMENT);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { announcement } = props;
      setFields({
        headline: announcement.headline,
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

  const formValidateHandler = (headline, text) => {
    const errors = {};

    if (headline.length < 3)
      errors.title = "Please enter a headline of at least three characters.";

    if (text.length < 10)
      errors.text = "Please enter body text of at least ten characters.";

    return errors;
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    const errors = formValidateHandler(fields.headline, fields.text);
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
          headline: fields.headline,
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
    setSubmittedAnnouncementHeadline(
      graphqlResponse.data.upsertannouncement.headline
    );
  };

  const clearFormHandler = () => {
    setFields(initialState);
  };

  return (
    <Form>
      {props.pageType === "edit" ? <h3>Edit Announcement</h3> : null}
      <Form.Field required>
        <label>Headline</label>
        <input
          placeholder="Enter Announcement headline..."
          id="headline"
          value={fields.headline}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.headline !== ""}
          errormessage={fieldErrors.headline}
        />
      </Form.Field>

      <Form.Field>
        <Form.TextArea
          required
          id="text"
          label="Text"
          placeholder="Enter body text..."
          value={fields.text}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.text !== ""}
          errormessage={fieldErrors.text}
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
        reveal={submittedAnnouncementHeadline !== ""}
        header={
          props.pageType === "edit"
            ? "Announcement Updated"
            : "Announcement Added"
        }
        content={
          (props.pageType === "edit"
            ? "You've successfully updated "
            : "You've successfully added ") +
          submittedAnnouncementHeadline +
          "."
        }
      />

      {submittedAnnouncementHeadline !== "" ? (
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
      headline
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
