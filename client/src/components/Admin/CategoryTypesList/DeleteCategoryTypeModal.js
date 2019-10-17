import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORYTYPES from "../../../apollo/queries/categoryTypes";
import QUERY_CATEGORYTYPESPAGE from "../../../apollo/queries/categoryTypesPage";

const DeleteCategoryTypeModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteCategoryType] = useMutation(MUTATION_DELETECATEGORYTYPE, {
    variables: {
      id: props.categorytypeid
    },
    refetchQueries: [
      { query: QUERY_CATEGORYTYPESPAGE, variables: props.variables },
      { query: QUERY_CATEGORYTYPES }
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
        Are you sure you want to delete the category type{" "}
        {props.categorytypename}?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteCategoryType}>
          Delete Category Type
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETECATEGORYTYPE = gql`
  mutation deleteCategoryType($id: ID!) {
    deletecategorytype(id: $id) {
      _id
      name
    }
  }
`;

DeleteCategoryTypeModal.propTypes = {
  categorytypename: PropTypes.string,
  categorytypeid: PropTypes.string,
  variables: PropTypes.object
};

export default DeleteCategoryTypeModal;
