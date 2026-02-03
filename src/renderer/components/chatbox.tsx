import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

import { IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function Chatbox() {
  const [message, setMessage] = useState<string>("");
  const [sendMessage, setSendMessage] = useState<boolean>(false);

  useEffect(() => {
    if (sendMessage) {
      console.log("sendMessage is TRUE... ", message);

      (async () => {
        // const whiteboardScreenshot = await window.nativeBits.getWhiteboardScreenshot();
        const whiteboardData = await window.nativeBits.getWhiteboardData();

        // console.log("screenshot data before claude: ", whiteboardScreenshot);
        console.log("whiteboard data before claude: ", whiteboardData);

        const shape = await window.nativeBits.requestClaude(message, whiteboardData);
        window.nativeBits.addShapeToWhiteboard(shape);
      })()
      setSendMessage(false);
    }
  }, [sendMessage])

  return (
    <div
      style={{
        backgroundColor: "rgba(225, 225, 225, 255)",
        borderRadius: "0 15px 15px 0",
        width: "250px",
        height: "100%",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch"
      }}
    >
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center"
      }} >
        <TextField 
          onChange={(e) => setMessage(e.target.value)} 
          label="Enter message..." 
          variant="outlined" 
          style={{
            width: "100%",
            height: "48px"
          }}
        />
        <IconButton onClick={() => setSendMessage(true)} color="primary">
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
}
