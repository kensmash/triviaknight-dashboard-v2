import React from "react";
import UsersList from "../../../components/Admin/UsersList/UsersList";

const Users = ({ match, history }) => (
  <UsersList history={history} match={match} />
);

export default Users;
