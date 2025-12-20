// import { useState } from "react";
// import axios from "axios";

// function ChatWindow({ user }) {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([
//     { sender: "bot", text: `Hey ${user.name} 👋 How can I help you today?` },
//   ]);

//   const sendMessage = async () => {
//     if (!message.trim()) return;

//     const userMsg = message;
//     setMessage("");
//     setChat((c) => [...c, { sender: "user", text: userMsg }]);

//     try {
//       const res = await axios.post(
//         "https://crickect-bot-newone.onrender.com/chat",
//         { message: userMsg }
//       );

//       setChat((c) => [
//         ...c,
//         { sender: "bot", text: res.data?.answer || "No response" },
//       ]);
//     } catch {
//       setChat((c) => [...c, { sender: "bot", text: "⚠️ Server error" }]);
//     }
//   };

//   return (
//     <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
//       <div style={{ padding: 15, background: "#1A73E8", color: "#fff" }}>
//         👋 Hey {user.name}
//       </div>

//       <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
//         {chat.map((m, i) => (
//           <div
//             key={i}
//             style={{ textAlign: m.sender === "user" ? "right" : "left" }}
//           >
//             <p>{m.text}</p>
//           </div>
//         ))}
//       </div>

//       <div style={{ display: "flex", padding: 10 }}>
//         <input
//           style={{ flex: 1 }}
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           placeholder="Ask cricket question..."
//         />
//         <button onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// }

// export default ChatWindow;
