import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const StatusSelect = props => (
  <Select
    name="form-field-name"
    value={props.value}
    placeholder="Filter by Status"
    onChange={props.publishedSelectHandler}
    options={[
      { value: false, label: "Draft" },
      { value: true, label: "Published" }
    ]}
  />
);

StatusSelect.propTypes = {
  value: PropTypes.string,
  publishedSelectHandler: PropTypes.func
};

export default StatusSelect;
