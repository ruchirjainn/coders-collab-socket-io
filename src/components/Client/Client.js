import Avatar from "react-avatar";
import "./Client";

function Client({ username }) {
  return (
    <div className="client">
      <Avatar name={username} size={50} round="34px" />
      <h4 className="username">{username}</h4>
    </div>
  );
}

export default Client;
