import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const CatOptionsSelect = (props) => {
  const catOptions = [
    {
      key: "Updated",
      text: "Updated",
      value: "showasupdated",
    },
    {
      key: "New",
      text: "New",
      value: "showasnew",
    },
  ];

  return (
    <Dropdown
      placeholder={props.placeholder}
      value={props.value}
      fluid
      selection
      clearable
      selectOnBlur={false}
      options={catOptions}
      onChange={props.catOptionsSelectHandler}
    />
  );
};

CatOptionsSelect.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string.isRequired,
  catOptionsSelectHandler: PropTypes.func.isRequired,
};

export default CatOptionsSelect;
