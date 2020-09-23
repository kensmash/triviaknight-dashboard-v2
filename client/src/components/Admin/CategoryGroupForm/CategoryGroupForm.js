import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Label, Form, Button, Checkbox } from "semantic-ui-react";
//components
import CategoriesSelect from "../CategoriesSelect/CategoriesSelect";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
//queries
import QUERY_CATEGORYGROUPS from "../../../apollo/queries/categoryGroups";
import QUERY_CATEGORYGROUPSPAGE from "../../../apollo/queries/categoryGroupsPage";

const CategoryGroupForm = (props) => {
  const [submittedCategoryGroupName, setSubmittedCategoryGroupName] = useState(
    ""
  );

  const { data: { categoryGroups } = {} } = useQuery(QUERY_CATEGORYGROUPS);

  const initialState = {
    name: "",
    displaytext: "",
    categories: [],
    active: false,
    iconname: "",
  };

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    displaytext: "",
    categories: "",
  });

  const [upsertCategoryGroup] = useMutation(MUTATION_UPSERTCATEGORYGROUP);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { categorygroup } = props;

      setFields({
        name: categorygroup.name,
        displaytext: categorygroup.displaytext,
        categories: categorygroup.categories
          ? categorygroup.categories.map((cat) => cat._id)
          : [],
        active: categorygroup.active,
        iconname: categorygroup.iconname ? categorygroup.iconname : "",
      });
    }
  }, [props]);

  const inputChangedHandler = (event) => {
    setFields({ ...fields, [event.target.id]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.id]: "" });
  };

  const catSelectHandler = (_event, data) => {
    setFields({ ...fields, categories: data.value });
    setFieldErrors({ ...fieldErrors, categories: "" });
  };

  const activeCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, active: true });
    } else {
      setFields({ ...fields, active: false });
    }
  };

  const formValidateHandler = (name, displaytext, categories, active) => {
    const errors = {};
    if (active && !categories.length)
      errors.categories = "Please select at least one Category.";
    if (name.length < 3)
      errors.name = "Please enter a name of at least three characters.";
    if (displaytext.length < 3)
      errors.name = "Please enter display text of at least three characters.";
    //check if genre already exists
    if (
      props.pageType !== "edit" &&
      categoryGroups.some((group) => group.name === name)
    )
      errors.name = "That group already exists!";
    return errors;
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    const errors = formValidateHandler(
      fields.name,
      fields.displaytext,
      fields.categories,
      fields.active
    );
    if (Object.keys(errors).length)
      return setFieldErrors(...fieldErrors, ...errors);
    UpsertCategoryGroupHandler();
  };

  const UpsertCategoryGroupHandler = async () => {
    const { name, displaytext, categories, active, iconname } = fields;
    //add category
    const graphqlResponse = await upsertCategoryGroup({
      variables: {
        input: {
          id: props.pageType === "edit" ? props.categorygroup._id : null,
          name,
          displaytext,
          categories,
          active,
          iconname,
        },
      },
      refetchQueries: [
        {
          query: QUERY_CATEGORYGROUPSPAGE,
          variables: {
            offset: 15 * parseInt(1, 10) - 15,
            limit: 15,
          },
        },
        { query: QUERY_CATEGORYGROUPS },
      ],
    });
    setSubmittedCategoryGroupName(
      graphqlResponse.data.upsertcategorygroup.name
    );
  };

  const clearFormHandler = () => {
    setFields(initialState);
  };

  return (
    <Form>
      {props.pageType === "edit" ? <h3>Edit Category Group</h3> : null}
      <Form.Field required>
        <label>Category Group Name</label>
        <input
          placeholder="Enter Category Group name..."
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
        <label>Icon Name</label>
        <input
          id="iconname"
          placeholder="Enter icon name..."
          value={fields.iconname}
          onChange={(event) => inputChangedHandler(event)}
        />
        <Label pointing as="a" href="https://icons.expo.fyi" target="_blank">
          Enter an icon name from react native vector icons.
        </Label>
      </Form.Field>

      <Form.Field required>
        <label>Category Group Display Text</label>
        <input
          placeholder="App Home Screen Text"
          id="displaytext"
          value={fields.displaytext}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.name !== ""}
          errormessage={fieldErrors.name}
        />
      </Form.Field>

      <Form.Field required>
        <label>Categories</label>
        <CategoriesSelect
          value={fields.categories}
          placeholder="Select Categories"
          catSelectHandler={(event, data) => catSelectHandler(event, data)}
        />
        <FormErrorMessage
          reveal={fieldErrors.categories !== ""}
          errormessage={fieldErrors.categories}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Active"
          checked={fields.active}
          onChange={(event, data) => activeCheckboxHandler(event, data)}
        />
      </Form.Field>

      <FormSuccessMessage
        reveal={submittedCategoryGroupName !== ""}
        header={
          props.pageType === "edit"
            ? "Category Group Updated"
            : "Category Group Added"
        }
        content={
          (props.pageType === "edit"
            ? "You've successfully updated"
            : "You've successfully added") +
          " the category group " +
          submittedCategoryGroupName +
          "."
        }
      />

      {submittedCategoryGroupName !== "" ? (
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

const MUTATION_UPSERTCATEGORYGROUP = gql`
  mutation upsertCategoryGroup($input: upsertCategoryGroupInput) {
    upsertcategorygroup(input: $input) {
      _id
      name
    }
  }
`;

CategoryGroupForm.propTypes = {
  pageType: PropTypes.string,
  categorygenre: PropTypes.object,
  history: PropTypes.object,
};

export default CategoryGroupForm;
