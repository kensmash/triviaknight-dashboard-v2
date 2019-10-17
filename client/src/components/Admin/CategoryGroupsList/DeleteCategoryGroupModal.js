import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORYGROUPS from "../../../apollo/queries/categoryGroups";
import QUERY_CATEGORYGROUPSPAGE from "../../../apollo/queries/categoryGroupsPage";

const DeleteCategoryGroupModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteCategoryGroup] = useMutation(MUTATION_DELETECATEGORYGROUP, {
    variables: {
      id: props.categorygroupid
    },
    refetchQueries: [
      { query: QUERY_CATEGORYGROUPSPAGE, variables: props.variables },
      { query: QUERY_CATEGORYGROUPS }
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
        Are you sure you want to delete the category group{" "}
        {props.categorygroupname}?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteCategoryGroup}>
          Delete Category Group
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETECATEGORYGROUP = gql`
  mutation deleteCategoryGroup($id: ID!) {
    deletecategorygroup(id: $id) {
      _id
      name
    }
  }
`;

DeleteCategoryGroupModal.propTypes = {
  categorygroupname: PropTypes.string,
  categorygroupid: PropTypes.string,
  variables: PropTypes.object
};

export default DeleteCategoryGroupModal;
