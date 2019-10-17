import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const IconSetSelect = props => (
  <Dropdown
    value={props.value}
    fluid
    selection
    clearable
    onChange={props.IconSetSelectHandler}
    options={[
      { value: "Ionicons", label: "Ionicons" },
      { value: "Entypo", label: "Entypo" },
      { value: "EvilIcons", label: "EvilIcons" },
      { value: "Feather", label: "Feather" },
      { value: "FontAwesome", label: "FontAwesome" },
      { value: "Foundation", label: "Foundation" },
      { value: "MaterialIcons", label: "MaterialIcons" },
      { value: "MaterialCommunityIcons", label: "MaterialCommunityIcons" },
      { value: "Octicons", label: "Octicons" },
      { value: "Zocial", label: "Zocial" },
      { value: "SimpleLineIcons", label: "SimpleLineIcons" }
    ]}
  />
);

IconSetSelect.propTypes = {
  value: PropTypes.string,
  IconSetSelectHandler: PropTypes.func
};

export default IconSetSelect;
