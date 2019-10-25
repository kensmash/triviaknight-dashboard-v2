import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_SIEGEGAMEPAGE from "../../../apollo/queries/siegeGamePage";

const DeleteSiegeGameModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteSiegeGame] = useMutation(MUTATION_DELETESIEGEGAME, {
    variables: {
      gameid: props.siegegameid
    },
    refetchQueries: [{ query: QUERY_SIEGEGAMEPAGE, variables: props.variables }]
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
        Are you sure you want to delete the siege game?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteSiegeGame}>
          Delete Siege Game
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETESIEGEGAME = gql`
  mutation deleteSiegeGame($gameid: ID!) {
    deletesiegegame(gameid: $gameid) {
      gameover
    }
  }
`;

DeleteSiegeGameModal.propTypes = {
  siegegameid: PropTypes.string.isRequired,
  variables: PropTypes.object
};

export default DeleteSiegeGameModal;
