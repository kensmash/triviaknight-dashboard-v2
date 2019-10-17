import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
//query
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORIES from "../../../apollo/queries/categories";

const CategoriesSelect = props => {
  const { loading, error, data } = useQuery(QUERY_CATEGORIES);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;

  const categories = data.categories.filter(
    cat => cat.published && !cat.partycategory
  );

  return (
    <Dropdown
      value={props.value}
      fluid
      search
      selection
      multiple
      clearable
      placeholder={props.placeholder}
      onChange={props.catSelectHandler}
      options={categories.map(item => ({
        key: item._id,
        value: item._id,
        text: item.name
      }))}
    />
  );
};

CategoriesSelect.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string.isRequired,
  catSelectHandler: PropTypes.func
};

export default CategoriesSelect;
