import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

function ChatApp({ user }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar user={user} />
      <ChatWindow user={user} />
    </div>
  );
}

export default ChatApp;
