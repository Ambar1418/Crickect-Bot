import { useState } from "react";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!name || !email) return alert("Fill all fields");

    const user = { name, email };
    localStorage.setItem("vk_user", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 300 }}>
        <h2>Welcome to VK Bot 🏏</h2>

        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleSubmit}>Continue</button>
      </div>
    </div>
  );
}

export default Login;
