function Sidebar({ user }) {
  return (
    <div style={{ width: 260, background: "#202123", color: "#fff" }}>
      <h3 style={{ padding: 16 }}>VK Bot</h3>
      <p style={{ paddingLeft: 16 }}>👋 {user.name}</p>

      <button style={{ margin: 16 }}>+ New Chat</button>
    </div>
  );
}

export default Sidebar;
