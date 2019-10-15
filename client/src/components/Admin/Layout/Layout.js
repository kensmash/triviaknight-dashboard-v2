import React, { Component } from "react";

class Layout extends Component {
  render() {
    return <div className="admincontent">{this.props.children}</div>;
  }
}

export default Layout;
