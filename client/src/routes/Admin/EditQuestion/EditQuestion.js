import React from "react";
//components
import QuestionForm from "../../../components/Admin/QuestionForm/QuestionForm";
////graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_QUESTION from "../../../apollo/queries/question";

const EditQuestion = ({ match, history }) => {
  const { loading, error, data: { question } = {} } = useQuery(QUERY_QUESTION, {
    variables: { id: match.params._id }
  });
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return <QuestionForm pageType="edit" question={question} history={history} />;
};

export default EditQuestion;
