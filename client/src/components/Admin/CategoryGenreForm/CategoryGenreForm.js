import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button, Checkbox } from "semantic-ui-react";
//components
import CatTypeSelect from "../CatTypeSelect/CatTypeSelect";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORYGENRES from "../../../apollo/queries/categoryGenres";
import QUERY_CATEGORYGENRESPAGE from "../../../apollo/queries/categoryGenresPage";
import QUERY_CLIENTCATEGORYGENRESSEARCH from "../../../apollo/queries/client-categoryGenreSearchCriteria";

const CategoryGenreForm = (props) => {
  const [submittedCategoryGenreName, setSubmittedCategoryGenreName] = useState(
    ""
  );

  const { data: { categoryGenreSearchCriteria } = {} } = useQuery(
    QUERY_CLIENTCATEGORYGENRESSEARCH
  );

  const { data: { categoryGenres } = {} } = useQuery(QUERY_CATEGORYGENRES);

  const initialState = {
    name: "",
    categorytypes: [],
    playable: false,
    nextquestactive: false,
  };

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    categorytypes: "",
  });

  const [upsertCategoryGenre] = useMutation(MUTATION_UPSERTCATEGORYGENRE);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { categorygenre } = props;
      setFields({
        name: categorygenre.name,
        categorytypes: categorygenre.categorytypes
          ? categorygenre.categorytypes.map((type) => type._id)
          : [],
        playable: categorygenre.playable,
        nextquestactive: categorygenre.nextquestactive,
      });
    }
  }, [props]);

  const inputChangedHandler = (event) => {
    setFields({ ...fields, [event.target.id]: event.target.value });
    setFieldErrors({ ...fieldErrors, [event.target.id]: "" });
  };

  const catTypeSelectHandler = (_event, data) => {
    setFields({ ...fields, categorytypes: data.value });
    setFieldErrors({ ...fieldErrors, categorytypes: "" });
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

  const formValidateHandler = (name, categorytypes) => {
    const errors = {};
    if (!categorytypes.length)
      errors.categorytypes = "Please select at least one Category type.";
    if (name.length < 3)
      errors.name = "Please enter a name of at least three characters.";
    //check if genre already exists
    if (
      props.pageType !== "edit" &&
      categoryGenres.some((genre) => genre.name === name)
    )
      errors.name = "That genre already exists!";
    return errors;
  };

  const formSubmitHandler = async (event) => {
    event.preventDefault();
    const errors = formValidateHandler(fields.name, fields.categorytypes);
    if (Object.keys(errors).length)
      return setFieldErrors(...fieldErrors, ...errors);
    UpsertCategoryGenreHandler();
  };

  const UpsertCategoryGenreHandler = async () => {
    //add category
    const graphqlResponse = await upsertCategoryGenre({
      variables: {
        input: {
          id: props.pageType === "edit" ? props.categorygenre._id : null,
          name: fields.name,
          categorytypes: fields.categorytypes,
          playable: fields.playable,
          nextquestactive: fields.nextquestactive,
        },
      },
      refetchQueries: [
        {
          query: QUERY_CATEGORYGENRESPAGE,
          variables: {
            offset:
              categoryGenreSearchCriteria.limit *
                parseInt(categoryGenreSearchCriteria.activePage, 10) -
              categoryGenreSearchCriteria.limit,
            limit: categoryGenreSearchCriteria.limit,
            name: categoryGenreSearchCriteria.name,
            categorytypes: categoryGenreSearchCriteria.types.length
              ? categoryGenreSearchCriteria.types.map((item) => item.value)
              : [],
          },
        },
        { query: QUERY_CATEGORYGENRES },
      ],
    });
    setSubmittedCategoryGenreName(
      graphqlResponse.data.upsertcategorygenre.name
    );
  };

  const clearFormHandler = () => {
    setFields(initialState);
  };

  return (
    <Form>
      {props.pageType === "edit" ? <h3>Edit Category Type</h3> : null}
      <Form.Field required>
        <label>Category Genre Name</label>
        <input
          placeholder="Enter Category Genre name..."
          id="name"
          value={fields.name}
          onChange={(event) => inputChangedHandler(event)}
        />
        <FormErrorMessage
          reveal={fieldErrors.name !== ""}
          errormessage={fieldErrors.name}
        />
      </Form.Field>
      <Form.Field required>
        <label>Category Types</label>
        <CatTypeSelect
          type="genre"
          value={fields.categorytypes}
          placeholder="Select Category Type(s)"
          catTypeSelectHandler={(event, data) =>
            catTypeSelectHandler(event, data)
          }
        />
        <FormErrorMessage
          reveal={fieldErrors.categorytypes !== ""}
          errormessage={fieldErrors.categorytypes}
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
        reveal={submittedCategoryGenreName !== ""}
        header={
          props.pageType === "edit"
            ? "Category Genre Updated"
            : "Category Genre Added"
        }
        content={
          (props.pageType === "edit"
            ? "You've successfully updated"
            : "You've successfully added") +
          " the category genre " +
          submittedCategoryGenreName +
          "."
        }
      />

      {submittedCategoryGenreName !== "" ? (
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

const MUTATION_UPSERTCATEGORYGENRE = gql`
  mutation upsertCategoryGenre($input: upsertCategoryGenreInput) {
    upsertcategorygenre(input: $input) {
      _id
      name
    }
  }
`;

CategoryGenreForm.propTypes = {
  pageType: PropTypes.string,
  categorygenre: PropTypes.object,
  history: PropTypes.object,
};

export default CategoryGenreForm;
