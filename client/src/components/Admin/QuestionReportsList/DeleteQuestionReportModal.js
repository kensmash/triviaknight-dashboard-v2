import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_QUESTIONREPORTSPAGE from "../../../apollo/queries/questionReportsPage";

const DeleteQuestionReportModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteQuestionReport] = useMutation(MUTATION_DELETEQUESTIONREPORT, {
    variables: {
      id: props.questionreportid
    },
    refetchQueries: [
      { query: QUERY_QUESTIONREPORTSPAGE, variables: props.variables }
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
        Are you sure you want to delete the question report?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteQuestionReport}>
          Delete Question Report
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETEQUESTIONREPORT = gql`
  mutation deleteQuestionReport($id: ID!) {
    deletequestionreport(id: $id) {
      _id
    }
  }
`;

DeleteQuestionReportModal.propTypes = {
  questionreportid: PropTypes.string,
  variables: PropTypes.object
};

export default DeleteQuestionReportModal;
