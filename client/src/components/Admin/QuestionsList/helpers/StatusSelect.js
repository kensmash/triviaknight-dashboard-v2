import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const StatusSelect = props => (
  <Dropdown
    name="form-field-name"
    value={props.value}
    fluid
    selection
    clearable
    placeholder="Filter by Status"
    onChange={props.publishedSelectHandler}
    options={[
      { key: "Draft", value: false, text: "Draft" },
      { key: "Published", value: true, text: "Published" }
    ]}
  />
);

StatusSelect.propTypes = {
  value: PropTypes.bool,
  publishedSelectHandler: PropTypes.func
};

export default StatusSelect;
