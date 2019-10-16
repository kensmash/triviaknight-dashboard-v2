import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const TypeSelect = props => (
  <Dropdown
    value={props.value}
    placeholder="Filter by Type"
    fluid
    selection
    clearable
    onChange={props.typeSelectHandler}
    options={[
      {
        key: "Multiple Choice",
        value: "Multiple Choice",
        text: "Multiple Choice"
      },
      { key: "True/False", value: "True/False", text: "True/False" }
    ]}
  />
);

TypeSelect.propTypes = {
  value: PropTypes.string,
  typeSelectHandler: PropTypes.func
};

export default TypeSelect;
