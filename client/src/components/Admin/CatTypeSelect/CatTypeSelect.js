import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYTYPES from "../../../queries/categoryTypes";

const CatTypeSelect = props => {
  const { loading, error, data } = useQuery(QUERY_CATEGORYTYPES);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error :(</div>;
  let categorytypes = data.categoryTypes;
  if (props.type === "genre") {
    categorytypes = data.categoryTypes.filter(type => type.hasgenres);
  }

  return (
    <Dropdown
      placeholder={props.placeholder}
      value={props.value}
      search
      selection
      multiple={props.type === "genre" ? true : false}
      onChange={props.catTypeSelectHandler}
      options={categorytypes.map(item => ({
        value: item._id,
        hasgenres: item.hasgenres,
        label: item.name
      }))}
    />
  );
};

CatTypeSelect.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string.isRequired,
  catTypeSelectHandler: PropTypes.func
};

export default CatTypeSelect;
