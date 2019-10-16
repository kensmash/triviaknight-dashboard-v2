import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const DifficultySelect = props => (
  <Dropdown
    value={props.value}
    placeholder="Filter by Difficulty"
    onChange={props.difficultySelectHandler}
    options={[
      { value: "Normal", text: "Normal" },
      { value: "Hard", text: "Hard" }
    ]}
  />
);

DifficultySelect.propTypes = {
  value: PropTypes.string,
  difficultySelectHandler: PropTypes.func
};

export default DifficultySelect;
