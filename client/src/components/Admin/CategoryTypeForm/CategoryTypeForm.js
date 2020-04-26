import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button, Label, Checkbox } from "semantic-ui-react";
//components
import IconSetSelect from "./IconSetSelect";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
//queries
import QUERY_CATEGORYTYPES from "../../../apollo/queries/categoryTypes";
import QUERY_CATEGORYTYPESPAGE from "../../../apollo/queries/categoryTypesPage";

const CategoryTypeForm = (props) => {
  const [submittedCategoryTypeName, setSubmittedCategoryTypeName] = useState(
    ""
  );

  const { data: { categoryTypes } = {} } = useQuery(QUERY_CATEGORYTYPES);

  const initialState = {
    name: "",
    iconname: "",
    iconset: "Ionicons",
    hasgenres: true,
    playable: false,
    nextquestactive: false,
  };

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    iconname: "",
  });

  const [upsertCategoryType] = useMutation(MUTATION_UPSERTCATEGORYTYPE);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { categorytype } = props;
      setFields({
        name: categorytype.name,
        iconname: categorytype.iconname,
        iconset: categorytype.iconset ? categorytype.iconset : "Ionicons",
        hasgenres: categorytype.hasgenres,
        playable: categorytype.playable,
        nextquestactive: categorytype.nextquestactive,
      });
    }
  }, [props]);

  const inputChangedHandler = (event) => {
    setFields({ ...fields, [event.target.id]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.id]: "" });
  };

  const IconSetSelectHandler = (_event, data) => {
    setFields({ ...fields, iconset: data.value });
  };

  const genreCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, hasgenres: true });
    } else {
      setFields({ ...fields, hasgenres: false });
    }
  };

  const playableCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, playable: true });
    } else {
      setFields({ ...fields, playable: false });
    }
  };

  const pressLuckCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, nextquestactive: true });
    } else {
      setFields({ ...fields, nextquestactive: false });
    }
  };

  const formValidateHandler = (name, iconname) => {
    const errors = {};
    if (name.length < 2)
      errors.name = "Please enter a name of at least two characters.";
    if (iconname.length < 2)
      errors.iconname = "Please enter an icon name of at least two characters.";
    //check if type already exists
    if (
      props.pageType !== "edit" &&
      categoryTypes.some((type) => type.name === name)
    )
      errors.name = "That category type already exists!";
    return errors;
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    const errors = formValidateHandler(fields.name, fields.iconname);
    if (Object.keys(errors).length)
      return setFieldErrors(...fieldErrors, ...errors);
    UpsertCategoryTypeHandler();
  };

  const UpsertCategoryTypeHandler = async () => {
    const {
      name,
      iconname,
      iconset,
      hasgenres,
      playable,
      nextquestactive,
    } = fields;
    //add category
    const graphqlResponse = await upsertCategoryType({
      variables: {
        input: {
          id: props.pageType === "edit" ? props.categorytype._id : null,
          name,
          iconname,
          iconset,
          hasgenres,
          playable,
          nextquestactive,
        },
      },
      refetchQueries: [
        {
          query: QUERY_CATEGORYTYPESPAGE,
          variables: {
            offset: 15 * parseInt(1, 10) - 15,
            limit: 15,
            name: "",
            hasgenres: "",
          },
        },
        { query: QUERY_CATEGORYTYPES },
      ],
    });
    setSubmittedCategoryTypeName(graphqlResponse.data.upsertcategorytype.name);
  };

  const clearFormHandler = () => {
    setFields(initialState);
  };

  return (
    <Form>
      {props.pageType === "edit" ? <h3>Edit Category Type</h3> : null}
      <Form.Field required>
        <label>Category Type Name</label>
        <input
          id="name"
          placeholder="Enter name..."
          value={fields.name}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.name !== ""}
          errormessage={fieldErrors.name}
        />
      </Form.Field>
      <Form.Field required>
        <label>Icon Name</label>
        <input
          id="iconname"
          placeholder="Enter icon name..."
          value={fields.iconname}
          onChange={(event) => inputChangedHandler(event)}
        />
        <Label
          pointing
          as="a"
          href="https://oblador.github.io/react-native-vector-icons/"
          target="_blank"
        >
          Enter an icon name from react native vector icons.
        </Label>
        <FormErrorMessage
          reveal={fieldErrors.iconname !== ""}
          errormessage={fieldErrors.iconname}
        />
      </Form.Field>
      <Form.Field>
        <label>Icon Set</label>
        <IconSetSelect
          value={fields.iconset}
          placeholder="Select Icon Set"
          IconSetSelectHandler={(event, data) =>
            IconSetSelectHandler(event, data)
          }
        />
        <Label pointing>
          Be sure to select the Icon Set if the icon is NOT from Ionicons.
        </Label>
      </Form.Field>
      <Form.Field>
        <Checkbox
          label="Has Genres"
          checked={fields.hasgenres}
          onChange={(event, data) => genreCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Playable"
          checked={fields.playable}
          onChange={(event, data) => playableCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Next Active Quest Topic"
          checked={fields.nextquestactive}
          onChange={(event, data) => pressLuckCheckboxHandler(event, data)}
        />
      </Form.Field>

      <FormSuccessMessage
        reveal={submittedCategoryTypeName !== ""}
        header={
          props.pageType === "edit"
            ? "Category Type Updated"
            : "Category Type Added"
        }
        content={
          (props.pageType === "edit"
            ? "You've successfully updated"
            : "You've successfully added") +
          " the category type " +
          submittedCategoryTypeName +
          "."
        }
      />

      {submittedCategoryTypeName !== "" ? (
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

const MUTATION_UPSERTCATEGORYTYPE = gql`
  mutation upsertCategoryType($input: upsertCategoryTypeInput) {
    upsertcategorytype(input: $input) {
      _id
      name
    }
  }
`;

CategoryTypeForm.propTypes = {
  pageType: PropTypes.string,
  categorytype: PropTypes.object,
  history: PropTypes.object,
};

export default CategoryTypeForm;
