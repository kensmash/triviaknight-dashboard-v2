import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_QUESTIONSPAGE from "../../../apollo/queries/questionsPage";

const DeleteQuestionModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteQuestion] = useMutation(MUTATION_DELETEQUESTION, {
    variables: {
      id: props.questionid
    },
    refetchQueries: [{ query: QUERY_QUESTIONSPAGE, variables: props.variables }]
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
      <Modal.Header>Are you sure you want to delete the question?</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteQuestion}>
          Delete Question
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETEQUESTION = gql`
  mutation deleteQuestion($id: ID!) {
    deletequestion(id: $id) {
      _id
      question
    }
  }
`;

DeleteQuestionModal.propTypes = {
  questionid: PropTypes.string,
  variables: PropTypes.object
};

export default DeleteQuestionModal;
