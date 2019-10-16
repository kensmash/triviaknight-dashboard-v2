import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Select from "react-select";
//css
import "react-select/dist/react-select.css";

const TypeSelect = props => (
  <Select
    name="form-field-name"
    value={props.value}
    placeholder="Filter by Type"
    onChange={props.typeSelectHandler}
    options={[
      { value: "Multiple Choice", label: "Multiple Choice" },
      { value: "True/False", label: "True/False" }
    ]}
  />
);

TypeSelect.propTypes = {
  value: PropTypes.string,
  typeSelectHandler: PropTypes.func
};

export default TypeSelect;
