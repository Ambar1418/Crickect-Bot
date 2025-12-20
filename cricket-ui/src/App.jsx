import { useState } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("vk-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Save user once logged in
  const handleLogin = () => {
    if (!name || !email) return alert("Please enter name & email");

    const userData = { name, email };
    localStorage.setItem("vk-user", JSON.stringify(userData));
    setUser(userData);

    setChat([
      {
        sender: "bot",
        text: `Hey ${name} 👋 How can I help you today?`,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");

    setChat((prev) => [...prev, { sender: "user", text: userMsg }]);

    try {
      const res = await axios.post(
        "https://crickect-bot-newone.onrender.com/chat",
        { message: userMsg }
      );

      const botReply =
        typeof res.data?.answer === "string"
          ? res.data.answer
          : "⚠️ No response from server";

      setChat((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: err.message || "⚠️ Server error. Please try again." },
      ]);
    }
  };

  /* ---------------- LOGIN SCREEN ---------------- */
  if (!user) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginCard}>
          <h2>🏏 VK Bot</h2>

          <input
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button style={styles.button} onClick={handleLogin}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- CHAT SCREEN ---------------- */
  return (
    <div style={styles.app}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/icons/vk-192.png" 
            alt="VK Bot"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
          />
          <span>Hey! {user.name} 👋</span>
        </div>
      </div>


      {/* CHAT AREA */}
      <div style={styles.chatArea}>
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background:
                msg.sender === "user" ? "#DCF8C6" : "#2b2b2b",
              color: msg.sender === "user" ? "#000" : "#fff",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div style={styles.inputBar}>
        <input
          style={styles.chatInput}
          placeholder="Ask cricket question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  app: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#1e1e1e",
  },

  header: {
  padding: "16px",
  background: "#1A73E8",
  color: "#fff",
  fontSize: "20px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
},


  chatArea: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  message: {
    maxWidth: "75%",
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "15px",
    lineHeight: "1.4",
  },

  inputBar: {
    display: "flex",
    padding: "12px",
    background: "#111",
    gap: "10px",
  },

  chatInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    fontSize: "15px",
  },

  sendBtn: {
    padding: "0 20px",
    borderRadius: "8px",
    border: "none",
    background: "#1A73E8",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },

  /* Login */
  loginWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f2f4f8",
  },

  loginCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "center",
  },

  input: {
    padding: "10px",
    fontSize: "14px",
  },

  button: {
    padding: "10px",
    background: "#1A73E8",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default App;
