"use client";

import { useState } from "react";
import Home from "./home"; 
import Performance from "./performance";

// Very ugly login page, but it works

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showPerformance, setShowPerformance] = useState(false); 

  const handleLogin = () => {
    console.log("Logging in with:", { username, password });
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true); 
    } else {
      console.log("Invalid credentials");
    }
  };

  // right now just load the home page in a react fragment
  if (isLoggedIn) {
    return (
      <>
      {/* You could load in the home component, i have commented it right now since it obstructs the buttons */}
       {/* <Home/>  */}
       <button 
        onClick={() => setShowPerformance(!showPerformance)}
        className="border-2 border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
        >
        {showPerformance ? "Hide Performance" : "Show Performance"}
        </button>

        {showPerformance && <Performance />}

        <button 
        onClick={() => setIsLoggedIn(false)}
        className="border-2 border-red-500 text-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition mt-4"
        >
        Logout
        </button>
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
