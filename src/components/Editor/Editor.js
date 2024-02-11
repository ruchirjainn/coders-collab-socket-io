import CodeMirror from "codemirror";
import { useEffect, useRef } from "react";
import "./Editor.css";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";

import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import ACTIONS from "../../Actions";

function EditorText({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById("realTimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      // sending the request to server for changing the code in the editor
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;

        const code = instance.getValue();

        onCodeChange(code);

        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }

    init();
  }, []);

  // Actual Real-time code update
  useEffect(() => {
    if (socketRef.current) {
      // response from server and the updated code is set to editor
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current?.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return <textarea id="realTimeEditor"></textarea>;
}

export default EditorText;
