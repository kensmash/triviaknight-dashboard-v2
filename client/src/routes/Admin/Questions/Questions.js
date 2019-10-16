import React from "react";
import QuestionsList from "../../../components/Admin/QuestionsList/QuestionsList";

const Questions = ({ history, match }) => (
  <div className="tableContainer">
    <QuestionsList history={history} match={match} />
  </div>
);

export default Questions;
