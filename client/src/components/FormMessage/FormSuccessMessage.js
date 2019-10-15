import React from "react";
import PropTypes from "prop-types";
import { Transition, Message } from "semantic-ui-react";

const FormSuccessMessage = ({ reveal, header, content }) => (
  <Transition visible={reveal} animation="fade down" duration={250}>
    <Message success header={header} content={content} />
  </Transition>
);

FormSuccessMessage.propTypes = {
  reveal: PropTypes.bool.isRequired,
  header: PropTypes.string,
  content: PropTypes.string
};

export default FormSuccessMessage;
