import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_SUPPORTREQUESTPAGE from "../../../apollo/queries/supportRequestPage";

const DeleteSupportRequestModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteSupportRequest] = useMutation(MUTATION_DELETESUPPORTREQUEST, {
    variables: {
      id: props.supportrequestid
    },
    refetchQueries: [
      { query: QUERY_SUPPORTREQUESTPAGE, variables: props.variables }
    ]
  });

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <Modal
      trigger={
        <Button size="mini" icon onClick={handleOpen}>
          <Icon name="x" />
        </Button>
      }
      open={modalOpen}
      onClose={handleClose}
      size="mini"
    >
      <Modal.Header>
        Are you sure you want to delete the support request?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteSupportRequest}>
          Delete Support Request
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETESUPPORTREQUEST = gql`
  mutation deleteSupportRequest($id: ID!) {
    deleterequest(id: $id) {
      _id
    }
  }
`;

DeleteSupportRequestModal.propTypes = {
  supportrequestid: PropTypes.string.isRequired,
  variables: PropTypes.object
};

export default DeleteSupportRequestModal;
