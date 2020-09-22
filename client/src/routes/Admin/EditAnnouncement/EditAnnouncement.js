import React from "react";
import PropTypes from "prop-types";
import AnnouncementForm from "../../../components/Admin/AnnouncementForm/AnnouncementForm";
//graphql
import { useQuery } from "@apollo/react-hooks";
import QUERY_ANNOUNCEMENT from "../../../apollo/queries/announcement";

const EditAnnouncement = ({ match, history }) => {
  const { loading, error, data: { announcement } = {} } = useQuery(
    QUERY_ANNOUNCEMENT,
    {
      variables: { id: match.params._id },
    }
  );
  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;
  return (
    <AnnouncementForm
      pageType="edit"
      announcement={announcement}
      match={match}
      history={history}
    />
  );
};

EditAnnouncement.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
};

export default EditAnnouncement;
