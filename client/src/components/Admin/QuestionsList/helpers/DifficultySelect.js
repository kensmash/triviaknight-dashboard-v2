import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const DifficultySelect = props => (
  <Select
    name="form-field-name"
    value={props.value}
    placeholder="Filter by Difficulty"
    onChange={props.difficultySelectHandler}
    options={[
      { value: "Normal", label: "Normal" },
      { value: "Hard", label: "Hard" }
    ]}
  />
);

DifficultySelect.propTypes = {
  value: PropTypes.string,
  difficultySelectHandler: PropTypes.func
};

export default DifficultySelect;
