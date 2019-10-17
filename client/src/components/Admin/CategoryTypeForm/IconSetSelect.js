import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

const IconSetSelect = props => (
  <Dropdown
    value={props.value}
    fluid
    selection
    onChange={props.IconSetSelectHandler}
    options={[
      { key: "Ionicons", value: "Ionicons", text: "Ionicons" },
      { key: "Entypo", value: "Entypo", text: "Entypo" },
      { key: "EvilIcons", value: "EvilIcons", text: "EvilIcons" },
      { key: "Feather", value: "Feather", text: "Feather" },
      { key: "FontAwesome", value: "FontAwesome", text: "FontAwesome" },
      { key: "Foundation", value: "Foundation", text: "Foundation" },
      { key: "MaterialIcons", value: "MaterialIcons", text: "MaterialIcons" },
      {
        key: "MaterialCommunityIcons",
        value: "MaterialCommunityIcons",
        text: "MaterialCommunityIcons"
      },
      { key: "Octicons", value: "Octicons", text: "Octicons" },
      { key: "Zocial", value: "Zocial", text: "Zocial" },
      {
        key: "SimpleLineIcons",
        value: "SimpleLineIcons",
        text: "SimpleLineIcons"
      }
    ]}
  />
);

IconSetSelect.propTypes = {
  value: PropTypes.string,
  IconSetSelectHandler: PropTypes.func
};

export default IconSetSelect;
