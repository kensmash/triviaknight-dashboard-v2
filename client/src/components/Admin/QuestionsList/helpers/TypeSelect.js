import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const TypeSelect = props => (
  <Dropdown
    value={props.value}
    placeholder="Filter by Type"
    onChange={props.typeSelectHandler}
    options={[
      { value: "Multiple Choice", text: "Multiple Choice" },
      { value: "True/False", text: "True/False" }
    ]}
  />
);

TypeSelect.propTypes = {
  value: PropTypes.string,
  typeSelectHandler: PropTypes.func
};

export default TypeSelect;
