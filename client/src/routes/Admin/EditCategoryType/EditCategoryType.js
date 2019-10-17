import React from "react";
import PropTypes from "prop-types";
import CategoryTypeForm from "../../../components/Admin/CategoryTypeForm/CategoryTypeForm";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYTYPE from "../../../apollo/queries/categoryType";

const EditCategoryType = ({ match, history }) => {
  const { loading, error, data: { categoryType } = {} } = useQuery(
    QUERY_CATEGORYTYPE,
    {
      variables: { id: match.params._id }
    }
  );
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return (
    <CategoryTypeForm
      pageType="edit"
      categorytype={categoryType}
      match={match}
      history={history}
    />
  );
};

EditCategoryType.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object
};

export default EditCategoryType;
