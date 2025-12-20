import { useState } from "react";
import axios from "axios";

function ChatWindow({ user }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `Hey ${user.name} 👋 How can I help you today?`,
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((c) => [...c, { sender: "user", text: message }]);
    setMessage("");

    const res = await axios.post(
      "https://crickect-bot-newone.onrender.com/chat",
      { message }
    );

    setChat((c) => [...c, { sender: "bot", text: res.data.answer }]);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: 20 }}>
        {chat.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left" }}>
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Ask anything about cricket..."
      />
    </div>
  );
}

export default ChatWindow;
