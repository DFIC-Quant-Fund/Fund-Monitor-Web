"use client";

import { useState } from "react";
import Home from "./home"; 

// Very ugly login page, but it works

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const handleLogin = () => {
    console.log("Logging in with:", { username, password });
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true); 
    } else {
      console.log("Invalid credentials");
    }
  };

  // right now just load the home page in a react fragment
  // could add a logout button, logic would prolly need to go here
  if (isLoggedIn) {
    return (
      <>
       <Home/> 
      </>
    );
  }

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
