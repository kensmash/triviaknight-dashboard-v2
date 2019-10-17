import React from "react";
import PropTypes from "prop-types";
import CategoryGroupForm from "../../../components/Admin/CategoryGroupForm/CategoryGroupForm";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORYGROUP from "../../../apollo/queries/categoryGroup";

const EditCategoryGroup = ({ match, history }) => {
  const { loading, error, data: { categoryGroup } = {} } = useQuery(
    QUERY_CATEGORYGROUP,
    {
      variables: { id: match.params._id }
    }
  );
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return (
    <CategoryGroupForm
      pageType="edit"
      categorygroup={categoryGroup}
      match={match}
      history={history}
    />
  );
};

EditCategoryGroup.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object
};

export default EditCategoryGroup;
