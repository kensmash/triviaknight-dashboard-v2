import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_JOUSTGAMEPAGE from "../../../apollo/queries/joustGamePage";

const DeleteJoustGameModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteJoustGame] = useMutation(MUTATION_DELETEJOUSTGAME, {
    variables: {
      gameid: props.joustgameid
    },
    refetchQueries: [{ query: QUERY_JOUSTGAMEPAGE, variables: props.variables }]
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
        Are you sure you want to delete the joust game?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteJoustGame}>
          Delete Joust Game
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETEJOUSTGAME = gql`
  mutation deleteJoustGame($gameid: ID!) {
    deletejoustgame(gameid: $gameid) {
      gameover
    }
  }
`;

DeleteJoustGameModal.propTypes = {
  joustgameid: PropTypes.string.isRequired,
  variables: PropTypes.object
};

export default DeleteJoustGameModal;
