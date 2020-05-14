import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const CatGameTypeSelect = (props) => (
  <Dropdown
    value={props.value}
    placeholder="Filter by Game Type"
    fluid
    selection
    clearable
    selectOnBlur={false}
    onChange={props.gameTypeSelectHandler}
    options={[
      { key: "All", value: null, text: "All" },
      { key: "Trivia Knight", value: false, text: "Trivia Knight" },
      { key: "Trivia Knight Party", value: true, text: "Trivia Knight Party" },
    ]}
  />
);

CatGameTypeSelect.propTypes = {
  value: PropTypes.bool,
  gameTypeSelectHandler: PropTypes.func,
};

export default CatGameTypeSelect;
