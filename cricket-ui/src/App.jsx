import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // USER STATE
  const [user, setUser] = useState(null);

  // CHAT STATE
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // LOGIN FORM STATE
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // LOAD USER FROM LOCAL STORAGE
  useEffect(() => {
    const savedUser = localStorage.getItem("vk_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      setChat([
        {
          sender: "bot",
          text: `Hey ${parsedUser.name} 👋 How can I help you with cricket today?`,
        },
      ]);
    }
  }, []);

  // HANDLE LOGIN
  const handleLogin = () => {
    if (!name || !email) {
      alert("Please enter name and email");
      return;
    }

    const userData = { name, email };
    localStorage.setItem("vk_user", JSON.stringify(userData));
    setUser(userData);

    setChat([
      {
        sender: "bot",
        text: `Hey ${name} 👋 How can I help you with cricket today?`,
      },
    ]);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { sender: "user", text: message }]);

    try {
      const res = await axios.post(
        "https://crickect-bot-newone.onrender.com/chat",
        { message },
        { withCredentials: false }
      );

      const botReply =
        res.data && typeof res.data.answer === "string"
          ? res.data.answer
          : "⚠️ No valid response received.";

      setChat((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: error.message || "⚠️ Server error occurred." },
      ]);
    }

    setMessage("");
  };

  // ================= LOGIN SCREEN =================
  if (!user) {
    return (
      <div
        style={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f7fb",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 30,
            borderRadius: 10,
            width: 320,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center" }}>🏏 VK Bot</h2>

          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 15 }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: 10,
              background: "#1A73E8",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ================= CHAT SCREEN =================
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
          fontSize: "22px",
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        🏏 VK Bot
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {chat.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent:
                msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                maxWidth: "70%",
                background:
                  msg.sender === "user" ? "#D4F7D4" : "rgba(0,0,0,0.75)",
                color: msg.sender === "user" ? "#000" : "#fff",
              }}
            >
              {String(msg.text)}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div
        style={{
          padding: 15,
          display: "flex",
          gap: 10,
          background: "#fff",
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask cricket question..."
          style={{ flex: 1, padding: 12 }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "12px 20px",
            background: "#1A73E8",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
