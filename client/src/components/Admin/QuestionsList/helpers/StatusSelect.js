import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const StatusSelect = props => (
  <Dropdown
    name="form-field-name"
    value={props.value}
    placeholder="Filter by Status"
    onChange={props.publishedSelectHandler}
    options={[
      { value: false, text: "Draft" },
      { value: true, text: "Published" }
    ]}
  />
);

StatusSelect.propTypes = {
  value: PropTypes.string,
  publishedSelectHandler: PropTypes.func
};

export default StatusSelect;
