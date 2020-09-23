import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button, Label, Checkbox } from "semantic-ui-react";
//components
import CatTypeSelect from "../CatTypeSelect/CatTypeSelect";
import CatGenreSelect from "../CatGenreSelect/CatGenreSelect";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORIES from "../../../apollo/queries/categories";
import QUERY_CATEGORIESPAGE from "../../../apollo/queries/categoriesPage";
import QUERY_CLIENTCATEGORYSEARCH from "../../../apollo/queries/client-categorySearchCriteria";

const CategoryForm = (props) => {
  const [submittedCategoryName, setSubmittedCategoryName] = useState("");

  const initialState = {
    categoryname: "",
    categorytype: "",
    categorygenres: [],
    iconname: "",
    categorydescription: "",
    published: false,
    partycategory: false,
    showasnew: false,
    showasupdated: false,
    showaspopular: false,
    joustexclusive: false,
    nextquestactive: false,
    questdescription: "",
  };

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    categoryname: "",
    type: "",
    categorydescription: "",
  });

  const { data: { categorySearchCriteria } = {} } = useQuery(
    QUERY_CLIENTCATEGORYSEARCH
  );

  const [upsertCategory] = useMutation(MUTATION_UPSERTCATEGORY);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { category } = props;

      setFields({
        categoryname: category.name,
        categorytype: category.type._id,
        categorygenres: category.genres.map((genre) => genre._id),
        iconname: category.iconname || "",
        categorydescription: category.description,
        published: category.published,
        partycategory: category.partycategory || false,
        showasnew: category.showasnew || false,
        showasupdated: category.showasupdated || false,
        showaspopular: category.showaspopular || false,
        joustexclusive: category.joustexclusive || false,
        nextquestactive: category.nextquestactive || false,
        questdescription: category.questdescription || "",
      });
    }
  }, [props]);

  const inputChangedHandler = (event) => {
    setFields({ ...fields, [event.target.id]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.id]: "" });
  };

  const catTypeSelectHandler = (_e, data) => {
    setFields({
      ...fields,
      categorytype: data.value,
    });

    setFieldErrors({ ...fieldErrors, type: "" });
  };

  const catGenreSelectHandler = (_e, data) => {
    setFields({ ...fields, categorygenres: data.value });
  };

  const publishedCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, published: true });
    } else {
      setFields({ ...fields, published: false });
    }
  };

  const partyCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, partycategory: true });
    } else {
      setFields({ ...fields, partycategory: false });
    }
  };

  const updatedCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, showasupdated: true });
    } else {
      setFields({ ...fields, showasupdated: false });
    }
  };

  const joustExclusiveCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, joustexclusive: true });
    } else {
      setFields({ ...fields, joustexclusive: false });
    }
  };

  const newCheckBoxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, showasnew: true, showasupdated: false });
    } else {
      setFields({ ...fields, showasnew: false });
    }
  };

  const pressLuckCheckboxHandler = (_event, data) => {
    if (data.checked) {
      setFields({ ...fields, nextquestactive: true });
    } else {
      setFields({ ...fields, nextquestactive: false });
    }
  };

  const formValidateHandler = (name, type, description) => {
    const errors = {};
    if (type.label === "") errors.type = "Please select a Category Type.";
    if (name.length < 2)
      errors.categoryname = "Please enter a name of at least two characters.";
    if (name.length > 60)
      errors.categoryname =
        "Sorry, that category name is too long. Please enter a category name of no more than 60 characters.";
    //check if category already exists
    if (
      props.pageType === "question" &&
      props.allCategories.categories.some((category) => category.name === name)
    )
      errors.categoryname = "That category already exists!";
    if (description.length < 8)
      errors.categorydescription =
        "Please enter a description of at least eight characters.";
    return errors;
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    //first, do form validation
    const errors = formValidateHandler(
      fields.categoryname,
      fields.categorytype,
      fields.categorydescription
    );
    //if errors, stop
    if (Object.keys(errors).length)
      return setFieldErrors({ ...fieldErrors, ...errors });
    //else, upsert category
    const graphqlResponse = await upsertCategory({
      variables: {
        input: {
          id: props.pageType === "edit" ? props.category._id : null,
          name: fields.categoryname,
          type: fields.categorytype,
          genres: fields.categorygenres,
          iconname: fields.iconname,
          description: fields.categorydescription,
          published: fields.published,
          partycategory: fields.partycategory,
          showasnew: fields.showasnew,
          showaspopular: fields.showaspopular,
          showasupdated: fields.showasupdated,
          joustexclusive: fields.joustexclusive,
          nextquestactive: fields.nextquestactive,
          questdescription: fields.questdescription,
        },
      },
      refetchQueries: [
        {
          query: QUERY_CATEGORIESPAGE,
          variables: {
            input: {
              offset:
                categorySearchCriteria.limit *
                  parseInt(categorySearchCriteria.activePage, 10) -
                categorySearchCriteria.limit,
              limit: categorySearchCriteria.limit,
              name: categorySearchCriteria.name,
              type: categorySearchCriteria.type,
              genres: categorySearchCriteria.genres,
              partycategory: categorySearchCriteria.partycategory === "true",
            },
          },
        },
        { query: QUERY_CATEGORIES },
      ],
    });
    setSubmittedCategoryName(graphqlResponse.data.upsertcategory.name);
  };

  const clearFormHandler = () => {
    setSubmittedCategoryName("");
    setFields(initialState);
  };

  return (
    <>
      {props.pageType === "edit" ? <h3>Edit Category</h3> : null}
      <Form.Field required>
        <label>Category Name</label>
        <input
          id="categoryname"
          placeholder="Enter name..."
          value={fields.categoryname}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.categoryname !== ""}
          errormessage={fieldErrors.categoryname}
        />
      </Form.Field>
      <Form.Field required>
        <label>Category Type</label>
        <CatTypeSelect
          value={fields.categorytype}
          placeholder="Select Category Type..."
          catTypeSelectHandler={(event, data) =>
            catTypeSelectHandler(event, data)
          }
        />
        <FormErrorMessage
          reveal={fieldErrors.type !== ""}
          errormessage={fieldErrors.type}
        />
      </Form.Field>

      <CatGenreSelect
        pagetype="catform"
        value={fields.categorygenres}
        categorytype={fields.categorytype}
        placeholder="Select Category Genre(s)..."
        catGenreSelectHandler={(event, data) =>
          catGenreSelectHandler(event, data)
        }
      />

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

      <Form.Field>
        <Form.TextArea
          required
          id="categorydescription"
          label="Description"
          placeholder="Enter description..."
          value={fields.categorydescription}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.categorydescription !== ""}
          errormessage={fieldErrors.categorydescription}
        />
      </Form.Field>

      <Form.Field>
        <Form.TextArea
          id="questdescription"
          label="Quest Description"
          placeholder="Enter Quest description..."
          value={fields.questdescription}
          onChange={(event) => inputChangedHandler(event)}
        />
      </Form.Field>

      {props.pageType !== "question" && (
        <FormSuccessMessage
          reveal={submittedCategoryName !== ""}
          header={
            props.pageType === "edit" ? "Category Updated" : "Category Added"
          }
          content={
            (props.pageType === "edit"
              ? "You've successfully updated"
              : "You've successfully added") +
            " the category " +
            submittedCategoryName +
            "."
          }
        />
      )}

      <Form.Field>
        <Checkbox
          label="Published"
          checked={fields.published}
          onChange={(event, data) => publishedCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Party Category"
          checked={fields.partycategory}
          onChange={(event, data) => partyCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Joust Only"
          checked={fields.joustexclusive}
          onChange={(event, data) => joustExclusiveCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Show as New"
          checked={fields.showasnew}
          onChange={(event, data) => newCheckBoxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Show as Updated"
          checked={fields.showasupdated}
          onChange={(event, data) => updatedCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Next Active Quest Topic"
          checked={fields.nextquestactive}
          onChange={(event, data) => pressLuckCheckboxHandler(event, data)}
        />
      </Form.Field>

      {submittedCategoryName !== "" ? (
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
            <Button color="grey" onClick={() => props.history.goBack()}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </>
  );
};

const MUTATION_UPSERTCATEGORY = gql`
  mutation upsertCategory($input: upsertCategoryInput) {
    upsertcategory(input: $input) {
      _id
      name
    }
  }
`;

CategoryForm.propTypes = {
  pageType: PropTypes.string,
  category: PropTypes.object,
  history: PropTypes.object,
};

export default CategoryForm;
