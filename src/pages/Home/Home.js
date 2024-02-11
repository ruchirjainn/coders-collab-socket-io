import { useState } from "react";
import "./Home.css";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  function handleCreateNewRoom(e) {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);

    toast.success("New room id created");
  }

  function handleJoinRoom() {
    if (!roomId || !username) {
      toast.error("ROOM ID & username is required");
      return;
    }

    // navigating to new page and passing the username & roomId
    navigate(`/editors/${roomId}`, {
      state: {
        username,
        roomId,
      },
    });
  }

  function handleInputEnter(e) {
    // e.code prints the key clicked
    if (e.code === "Enter") {
      handleJoinRoom();
    }
  }

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          src="/leetcode-collab.png"
          className="homePageLogo"
          alt="Leetcode Collab Logo"
        />

        <h4 className="mainLabel">Paste invitation ROOM ID</h4>

        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            value={roomId}
            onKeyUp={handleInputEnter}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            value={username}
            onKeyUp={handleInputEnter}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button className="btn joinBtn" onClick={handleJoinRoom}>
            Join
          </button>

          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a onClick={handleCreateNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>

      <footer>
        <h4>
          Built with 💗&nbsp;-{" "}
          <a href="https://github.com/ruchirjainn">Ruchir Jain</a>{" "}
        </h4>
      </footer>
    </div>
  );
}

export default Home;
