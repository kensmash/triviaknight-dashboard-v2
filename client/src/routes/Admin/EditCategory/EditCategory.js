import React from "react";
import { Form } from "semantic-ui-react";
//components
import CategoryForm from "../../../components/Admin/CategoryForm/CategoryForm";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_CATEGORY from "../../../apollo/queries/category";

const EditCategory = ({ match, history }) => {
  const { loading, error, data: { category } = {} } = useQuery(QUERY_CATEGORY, {
    variables: { id: match.params._id }
  });
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return (
    <Form>
      <CategoryForm pageType="edit" category={category} history={history} />
    </Form>
  );
};

export default EditCategory;
