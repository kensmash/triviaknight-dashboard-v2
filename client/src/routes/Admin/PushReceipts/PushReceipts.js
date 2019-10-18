import React from "react";
import PushReceiptsList from "../../../components/Admin/PushReceiptsList/PushReceiptsList";

const PushReceipts = props => (
  <PushReceiptsList history={props.history} match={props.match} />
);

export default PushReceipts;
