import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Form, Button, Checkbox } from "semantic-ui-react";
//components
import CatTypeSelect from "../CatTypeSelect/CatTypeSelect";
import CatGenreSelect from "../CatGenreSelect/CatGenreSelect";
import FormErrorMessage from "../../FormMessage/FormErrorMessage";
import FormSuccessMessage from "../../FormMessage/FormSuccessMessage";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import categoriesQuery from "../../../apollo/queries/categories";
import categoriesPageQuery from "../../../apollo/queries/categoriesPage";
import categorySearchCriteria from "../../../apollo/queries/client-categorySearchCriteria";

const CategoryForm = props => {
  const [submittedCategoryGenreName, setSubmittedCategoryGenreName] = useState(
    ""
  );

  const initialState = {
    name: "",
    categorytypes: [],
    playable: false,
    pressluckactive: false
  };

  const [fields, setFields] = useState(initialState);

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    categorytypes: ""
  });

  const [upsertCategory] = useMutation(MUTATION_UPSERTCATEGORY);

  useEffect(() => {
    if (props.pageType === "edit") {
      const { categorygenre } = props;
      setFields({
        name: categorygenre.name,
        categorytypes: categorygenre.categorytypes
          ? categorygenre.categorytypes.map(type => ({
              label: type.name,
              value: type._id
            }))
          : [],
        playable: categorygenre.playable,
        pressluckactive: categorygenre.pressluckactive
      });
    }
  }, [props]);

  catTypeSelectHandler = categorytypes => {
    this.setState({
      fields: { ...this.state.fields, categorytypes },
      fieldErrors: { ...this.state.fieldErrors, categorytypes: "" }
    });
  };

  playableCheckboxHandler = (event, data) => {
    if (data.checked) {
      this.setState({ fields: { ...this.state.fields, playable: true } });
    } else {
      this.setState({ fields: { ...this.state.fields, playable: false } });
    }
  };

  pressLuckCheckboxHandler = (event, data) => {
    if (data.checked) {
      this.setState({
        fields: { ...this.state.fields, pressluckactive: true }
      });
    } else {
      this.setState({
        fields: { ...this.state.fields, pressluckactive: false }
      });
    }
  };

  formValidateHandler = (name, categorytypes) => {
    const errors = {};
    if (!categorytypes.length)
      errors.categorytypes = "Please select at least one Category type.";
    if (name.length < 3)
      errors.name = "Please enter a name of at least three characters.";
    //check if genre already exists
    if (
      this.props.pageType !== "edit" &&
      this.props.allCategoryGenres.categoryGenres.some(
        genre => genre.name === name
      )
    )
      errors.name = "That genre already exists!";
    return errors;
  };

  formSubmitHandler = async event => {
    event.preventDefault();
    const errors = this.formValidateHandler(
      this.state.fields.name,
      this.state.fields.categorytypes
    );
    if (Object.keys(errors).length)
      return this.setState({
        fieldErrors: { ...this.state.fieldErrors, ...errors }
      });
    this.AddorEdit();
  };

  AddCategoryGenreHandler = async () => {
    const { categoryGenreSearchCriteria } = this.props;
    //add category
    const graphqlResponse = await this.props.addCategoryGenre({
      variables: {
        name: this.state.fields.name,
        categorytypes: this.state.fields.categorytypes.map(type => type.value),
        playable: this.state.fields.playable,
        pressluckactive: this.state.fields.pressluckactive
      },
      refetchQueries: [
        {
          query: categoryGenresPageQuery,
          variables: {
            offset:
              categoryGenreSearchCriteria.limit *
                parseInt(categoryGenreSearchCriteria.activePage, 10) -
              categoryGenreSearchCriteria.limit,
            limit: categoryGenreSearchCriteria.limit,
            name: categoryGenreSearchCriteria.name,
            categorytypes: categoryGenreSearchCriteria.types.length
              ? categoryGenreSearchCriteria.types.map(item => item.value)
              : []
          }
        },
        { query: catGenresQuery }
      ]
    });
    this.setState({
      submittedCategoryGenreName: graphqlResponse.data.addcategorygenre.name
    });
  };

  const clearFormHandler = () => {
    setFields(initialState);
  };

  return (
    <Form>
      {this.props.pageType === "edit" ? <h3>Edit Category Type</h3> : null}
      <Form.Field required>
        <label>Category Genre Name</label>
        <input
          placeholder="Enter Category Genre name..."
          id="name"
          value={this.state.fields.name}
          onChange={event => this.inputChangedHandler(event)}
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
          value={this.state.fields.categorytypes}
          placeholder="Select Category Type(s)"
          catTypeSelectHandler={categorytypes =>
            this.catTypeSelectHandler(categorytypes)
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
          checked={this.state.fields.playable}
          onChange={(event, data) => this.playableCheckboxHandler(event, data)}
        />
      </Form.Field>

      <Form.Field>
        <Checkbox
          label="Active Press Your Luck Genre"
          checked={this.state.fields.pressluckactive}
          onChange={(event, data) => this.pressLuckCheckboxHandler(event, data)}
        />
      </Form.Field>

      <FormSuccessMessage
        reveal={this.state.submittedCategoryGenreName !== ""}
        header={
          this.props.pageType === "edit"
            ? "Category Genre Updated"
            : "Category Genre Added"
        }
        content={
          (this.props.pageType === "edit"
            ? "You've successfully updated"
            : "You've successfully added") +
          " the category genre " +
          this.state.submittedCategoryGenreName +
          "."
        }
      />

      {this.state.submittedCategoryGenreName !== "" ? (
        this.props.pageType === "edit" ? (
          <Button primary onClick={this.props.history.goBack}>
            Go Back
          </Button>
        ) : (
          <Button color="blue" onClick={this.clearFormHandler}>
            Add Another
          </Button>
        )
      ) : (
        <div className="formButtonGroup">
          <Button color="green" onClick={this.formSubmitHandler}>
            Submit
          </Button>
          {this.props.pageType === "edit" && (
            <Button color="grey" onClick={this.props.history.goBack}>
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

CatGenreForm.propTypes = {
  pageType: PropTypes.string,
  categorygenre: PropTypes.object,
  history: PropTypes.object
};

export default CatCatGenreFormegoryForm;
