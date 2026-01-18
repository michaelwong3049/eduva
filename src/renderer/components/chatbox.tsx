import { createRoot } from 'react-dom/client';
import { useState } from 'react';

import { TextField } from '@mui/material';

export default function Chatbox() {
  const [message, setMessage] = useState("");

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
      </div>
    </div>
  );
}
