"use client";

import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  const handleLogin = () => {
    console.log("Logging in with:", { username, password });
    if (username === "admin" && password === "admin") {
      console.log("Login successful");
      setIsLoggedIn(true); // Update state to show dashboard
    } else {
      console.log("Invalid credentials");
    }
  };

  // If logged in, show dashboard content
  if (isLoggedIn) {
    return (
      <div>
        <h1>Welcome, {username}!</h1>
        <p>This is your dashboard.</p>
        <button onClick={() => setIsLoggedIn(false)}>Logout</button>
      </div>
    );
  }

  // If not logged in, show login form
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
}
