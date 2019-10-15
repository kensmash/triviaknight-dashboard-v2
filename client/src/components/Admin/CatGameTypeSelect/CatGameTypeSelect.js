import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const CatGameTypeSelect = props => (
  <Dropdown
    value={props.value}
    placeholder="Filter by Game Type"
    onChange={props.gameTypeSelectHandler}
    options={[
      { value: null, label: "All" },
      { value: false, label: "Trivia Knight" },
      { value: true, label: "Trivia Knight Party" }
    ]}
  />
);

CatGameTypeSelect.propTypes = {
  value: PropTypes.bool,
  gameTypeSelectHandler: PropTypes.func
};

export default CatGameTypeSelect;
