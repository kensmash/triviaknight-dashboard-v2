import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal } from "semantic-ui-react";
//graphql
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import QUERY_CATEGORYGENRES from "../../../apollo/queries/categoryGenres";
import QUERY_CATEGORYGENRESPAGE from "../../../apollo/queries/categoryGenresPage";

const DeleteCategoryGenreModal = props => {
  const [modalOpen, setModalOpen] = useState(false);

  const [deleteCategoryGenre] = useMutation(MUTATION_DELETECATEGORYGENRE, {
    variables: {
      id: props.categorygenreid
    },
    refetchQueries: [
      { query: QUERY_CATEGORYGENRESPAGE, variables: props.variables },
      { query: QUERY_CATEGORYGENRES }
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
        Are you sure you want to delete the category genre{" "}
        {props.categorygenrename}?
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>This action can’t be undone.</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button negative onClick={deleteCategoryGenre}>
          Delete Category Genre
        </Button>
        <Button onClick={handleClose}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

const MUTATION_DELETECATEGORYGENRE = gql`
  mutation deleteCategoryGenre($id: ID!) {
    deletecategorygenre(id: $id) {
      _id
      name
    }
  }
`;

DeleteCategoryGenreModal.propTypes = {
  categorygenrename: PropTypes.string,
  categorygenreid: PropTypes.string,
  variables: PropTypes.object
};

export default DeleteCategoryGenreModal;
