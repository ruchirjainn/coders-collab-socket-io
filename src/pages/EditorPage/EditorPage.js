import { useEffect, useRef, useState } from "react";
import "./EditorPage.css";
import Client from "../../components/Client/Client";
import EditorText from "../../components/Editor/Editor";
import { initSocket } from "../../socket";
import ACTIONS from "../../Actions";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigate = useNavigate();
  const { roomId } = useParams();
  const codeRef = useRef(null);

  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function init() {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(err) {
        console.log("Socket Error from EditorPage.js is:" + err);
        toast.error("Connection failed. Please try again later.");
        reactNavigate("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        // roomId: location.state?.roomId,
        roomId: roomId,
        username: location.state?.username,
      });

      // listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);

            console.log(
              `${username} joined the room with socketId: ${socketId}`
            );
          }

          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // listening for leaving / disconnected event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);

        console.log(`${username} with socketId: ${socketId} left the room`);

        // removing the left username socketId from the clients array
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    }

    init();

    // cleaning function / listener the unmounting
    return () => {
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.disconnect();
    };
  }, []);

  async function handleCopyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("ROOM Id has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the ROOM Id");
      console.log("Error from handleCopyRoomID function: " + err);
    }
  }

  async function handleLeaveRoom() {
    reactNavigate("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img src="/leetcode-collab.png" className="logoImage" alt="Logo" />
          </div>
        </div>

        {/* <h3>Connected</h3> */}

        <div className="clientsList">
          {clients.map((client) => (
            <Client username={client.username} key={client.socketId} />
          ))}
        </div>

        <div className="buttonDiv">
          <button className="btn copyBtn" onClick={handleCopyRoomId}>
            Copy ROOM ID
          </button>
          <button className="btn leaveBtn" onClick={handleLeaveRoom}>
            Leave
          </button>
        </div>
      </div>

      <div className="editorWrap">
        <EditorText
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
}

export default EditorPage;
