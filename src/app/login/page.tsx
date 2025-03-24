"use client"; // Ensure this is a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Dummy authentication logic (Replace with real authentication)
        if (email === "admin@dfic.com" && password === "admin") {
            localStorage.setItem("auth", "true"); 
            router.push("/"); // Redirect to the home page or performance page
        } else {
            alert("Invalid credentials!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#800000]">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-[#800000] text-white p-3 rounded-lg font-semibold hover:bg-[#600000] transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
