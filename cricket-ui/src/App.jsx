import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("vk-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isTyping]);

  const handleLogin = () => {
    if (!name || !email) return alert("Please enter name & email");
    const userData = { name, email };
    localStorage.setItem("vk-user", JSON.stringify(userData));
    setUser(userData);
    setChat([
      {
        sender: "bot",
        text: `Hey ${name} 👋 I'm VK Bot, your cricket expert. Ask me anything about the game!`,
      },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem("vk-user");
    setUser(null);
    setChat([]);
  };

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:8000" 
    : "https://crickect-bot-newone.onrender.com";

  const sendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMsg = message;
    setMessage("");
    setChat((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error("Server error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      // Add an empty bot message to start streaming into
      setChat((prev) => [...prev, { sender: "bot", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botResponse += chunk;

        // Update the last message in chat
        setChat((prev) => {
          const newChat = [...prev];
          newChat[newChat.length - 1].text = botResponse;
          return newChat;
        });
      }
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Connection lost. Please check your network or try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ---------------- LOGIN SCREEN ---------------- */
  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h2>🏏 VK Bot<span>.</span></h2>
          <p>Your Ultimate Cricket Companion</p>
          <input
            className="login-input"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="login-input"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- CHAT SCREEN ---------------- */
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          🏏 VK Bot<span>.</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Recent Chats</p>
          <div className="history-item">World Cup 2023 Winners</div>
          <div className="history-item">Virat Kohli Stats</div>
          <div className="history-item">IPL 2024 Schedule</div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-muted)", padding: "10px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}
        >
          Sign Out
        </button>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="user-profile">
            <div className="avatar">{user.name[0].toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "14px" }}>{user.name}</div>
              <div style={{ fontSize: "12px", color: "#10b981" }}>● Online</div>
            </div>
          </div>
          <div style={{ color: "var(--text-muted)", cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
        </header>

        <div className="messages-container">
          {chat.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="message bot" style={{ padding: "12px 16px" }}>
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <input
              className="chat-input"
              placeholder="Ask me about scores, stats, or cricket history..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              className="send-button" 
              onClick={sendMessage}
              disabled={!message.trim() || isTyping}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "12px" }}>
            VK Bot may provide data from cached CSV files. Always verify real-time scores.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
