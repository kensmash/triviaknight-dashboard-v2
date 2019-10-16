import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORIES from "../../../../apollo/queries/categories";

const CategorySelect = props => {
  const { loading, error, data } = useQuery(QUERY_CATEGORIES);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;

  return (
    <Dropdown
      value={props.value}
      placeholder="Filter by Category"
      onChange={props.categorySelectHandler}
      options={data.categories.map(item => ({
        key: item._id,
        value: item._id,
        text: item.name
      }))}
    />
  );
};

CategorySelect.propTypes = {
  value: PropTypes.string,
  categorySelectHandler: PropTypes.func
};

export default CategorySelect;
