import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Select from "react-select";
//query
import categoriesQuery from "../../../../queries/categories";
//css
import "react-select/dist/react-select.css";

const CategorySelect = props => (
  <Query query={categoriesQuery}>
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        <Select
          name="categoryselect"
          value={props.value}
          placeholder="Filter by Category"
          onChange={props.categorySelectHandler}
          inputProps={{ type: "react-type" }}
          options={data.categories.map(item => ({
            value: item._id,
            label: item.name
          }))}
        />
      );
    }}
  </Query>
);

CategorySelect.propTypes = {
  value: PropTypes.string,
  categorySelectHandler: PropTypes.func
};

export default CategorySelect;
