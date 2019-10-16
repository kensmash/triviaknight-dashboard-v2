import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { Card, Form, Transition, Button, Icon } from "semantic-ui-react";
import Select from "react-select";
import CategoryForm from "../../../../components/Admin/CategoryForm/CategoryForm";
import FormErrorMessage from "../../../../components/FormMessage/FormErrorMessage";
//query
import categoriesQuery from "../../../../queries/categories";
//css
import "react-select/dist/react-select.css";

class CategorySelect extends Component {
  state = {
    showCategoryForm: false
  };

  toggleCollapse = () => {
    this.setState({ showCategoryForm: !this.state.showCategoryForm });
  };

  questionCategorySelectHandler = category => {
    if (this.state.showCategoryForm) {
      this.setState({ showCategoryForm: !this.state.showCategoryForm });
    }
    this.props.questionCategorySelectHandler(category);
  };

  render() {
    return (
      <Query query={categoriesQuery}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error :(</div>;

          return (
            <Card fluid>
              <Card.Content>Category</Card.Content>
              <Card.Content>
                <Form.Field>
                  <Select
                    name="categoryselect"
                    value={this.props.selectedCategory}
                    placeholder="Select Category"
                    onChange={this.questionCategorySelectHandler}
                    inputProps={{ type: "react-type" }}
                    options={data.categories.map(item => ({
                      value: item._id,
                      label: item.name
                    }))}
                  />
                </Form.Field>

                <Button
                  className="button-addnewcat"
                  icon
                  size="mini"
                  compact
                  labelPosition="left"
                  onClick={this.toggleCollapse}
                >
                  <Icon name={this.state.showCategoryForm ? "minus" : "plus"} />
                  Add New
                </Button>

                <Transition
                  visible={this.state.showCategoryForm}
                  animation="slide down"
                  duration={400}
                >
                  <div className="categoryform">
                    <CategoryForm
                      pageType="question"
                      catCreateHandler={this.questionCategorySelectHandler}
                    />
                  </div>
                </Transition>
                <FormErrorMessage
                  reveal={this.props.errormessage !== ""}
                  errormessage={this.props.errormessage}
                />
              </Card.Content>
            </Card>
          );
        }}
      </Query>
    );
  }
}

CategorySelect.propTypes = {
  type: PropTypes.string,
  selectedCategory: PropTypes.string,
  questionCategorySelectHandler: PropTypes.func
};

export default CategorySelect;
