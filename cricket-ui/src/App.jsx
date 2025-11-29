import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { sender: "user", text: message }]);

    try {
     const res = await axios.post("https://crickect-bot-newone.onrender.com/chat", {
    message
});


      const botReply = res.data.answer;
      setChat((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: err },
      ]);
    }

    setMessage("");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f6f7fb",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "20px",
          background: "#1A73E8",
          color: "white",
          fontSize: "24px",
          fontWeight: "700",
          textAlign: "center",
          letterSpacing: "0.5px",
          borderBottom: "3px solid #1558b0",
        }}
      >
        🏏 Cricket Chatbot
      </div>


      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
        }}
      >
        {chat.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "15px",
                lineHeight: "1.4",
                maxWidth: "70%",
                color: msg.sender === "user" ? "#000" : "#fff",
                background:
                  msg.sender === "user" ? "#D4F7D4" : "rgba(0,0,0,0.75)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div
        style={{
          padding: "15px",
          background: "#fff",
          display: "flex",
          gap: "10px",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask cricket question..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "15px",
            outline: "none",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "12px 22px",
            background: "#1A73E8",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
