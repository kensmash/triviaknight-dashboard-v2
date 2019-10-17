import React from "react";
import PropTypes from "prop-types";
import CatGenreForm from "../../../components/Admin/CatGenreForm/CatGenreForm";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYGENRE from "../../../apollo/queries/categoryGenre";

const EditCategoryGenre = ({ match, history }) => {
  const { loading, error, data: { categoryGenre } = {} } = useQuery(
    QUERY_CATEGORYGENRE,
    {
      variables: { id: match.params._id }
    }
  );
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return (
    <CatGenreForm
      pageType="edit"
      categorygenre={categoryGenre}
      match={match}
      history={history}
    />
  );
};

EditCategoryGenre.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object
};

export default EditCategoryGenre;
