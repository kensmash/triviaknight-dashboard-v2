import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dropdown,
  Card,
  Form,
  Transition,
  Button,
  Icon
} from "semantic-ui-react";
import CategoryForm from "../../../../components/Admin/CategoryForm/CategoryForm";
import FormErrorMessage from "../../../../components/FormMessage/FormErrorMessage";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORIES from "../../../../apollo/queries/categories";

const CategorySelect = props => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const { loading, error, data } = useQuery(QUERY_CATEGORIES);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;

  const cats = data.categories.map(item => ({
    key: item._id,
    value: item._id,
    text: item.name
  }));

  const toggleCollapse = () => {
    setShowCategoryForm(!showCategoryForm);
  };

  const questionCategorySelectHandler = category => {
    if (showCategoryForm) {
      setShowCategoryForm(false);
    }
    props.categorySelectHandler(category);
  };

  return (
    <Card fluid>
      <Card.Content>Category</Card.Content>
      <Card.Content>
        <Form.Field>
          <Dropdown
            value={props.selectedCategory}
            fluid
            selection
            search
            clearable
            placeholder="Filter by Category"
            onChange={props.categorySelectHandler}
            options={cats}
          />
        </Form.Field>

        <Button
          className="button-addnewcat"
          icon
          size="mini"
          compact
          labelPosition="left"
          onClick={toggleCollapse}
        >
          <Icon name={showCategoryForm ? "minus" : "plus"} />
          Add New
        </Button>

        <Transition
          visible={showCategoryForm}
          animation="slide down"
          duration={400}
        >
          <div className="categoryform">
            <CategoryForm
              pageType="question"
              catCreateHandler={questionCategorySelectHandler}
            />
          </div>
        </Transition>
        <FormErrorMessage
          reveal={props.errormessage !== ""}
          errormessage={props.errormessage}
        />
      </Card.Content>
    </Card>
  );
};

CategorySelect.propTypes = {
  type: PropTypes.string,
  selectedCategory: PropTypes.string,
  categorySelectHandler: PropTypes.func
};

export default CategorySelect;
