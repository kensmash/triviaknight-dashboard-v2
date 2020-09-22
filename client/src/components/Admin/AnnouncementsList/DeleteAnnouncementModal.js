import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_ANNOUNCEMENTSPAGE from "../../../apollo/queries/announcementsPage";

const DeleteAnnouncementModal = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteAnnouncement] = useMutation(MUTATION_DELETEANNOUNCEMENT, {
    variables: {
      id: props.announcementid,
    },
    refetchQueries: [
      { query: QUERY_ANNOUNCEMENTSPAGE, variables: props.variables },
    ],
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
        Are you sure you want to delete the announcement?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteAnnouncement}>
          Delete Announcement
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETEANNOUNCEMENT = gql`
  mutation deleteAnnouncement($id: ID!) {
    deleteannouncement(id: $id) {
      _id
    }
  }
`;

DeleteAnnouncementModal.propTypes = {
  announcementid: PropTypes.string.isRequired,
  variables: PropTypes.object,
};

export default DeleteAnnouncementModal;
