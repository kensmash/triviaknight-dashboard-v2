import React from "react";
import PropTypes from "prop-types";
import { Transition, Message } from "semantic-ui-react";

const FormErrorMessage = ({ reveal, errormessage }) => (
  <Transition visible={reveal} animation="fade down" duration={250}>
    <Message error content={errormessage} />
  </Transition>
);

FormErrorMessage.propTypes = {
  reveal: PropTypes.bool.isRequired,
  errormessage: PropTypes.string
};

export default FormErrorMessage;
