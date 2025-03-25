"use client"; 

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../loading"; // Import your loading component

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(true); // ✅ Added auth loading state
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "/";

    // check if user is already logged in, redirect if true
    useEffect(() => {
        const token = localStorage.getItem("auth");
        if (token) {
            router.push(redirectPath); 
        } else {
            setAuthLoading(false); // Finish auth check
        }
    }, [router, redirectPath]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === "admin@dfic.com" && password === "admin") {
            localStorage.setItem("auth", "true"); 
            router.push(redirectPath);
        } else {
            alert("Invalid credentials!");
        }
    };

    // show loading indicator while checking authentication
    if (authLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <div className="flex items-end justify-center mb-6">
                    <img src="/dfic-logo-no-text.png" alt="DFIC Logo" className="w-8 mr-4" />
                    <h2 className="text-2xl font-bold text-center text-[#800000]">DFIC Fund Monitor</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                    <input
                        type="email"
                        name="email" 
                        placeholder="Email"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username" 
                    />
                    <input
                        type="password"
                        name="password" 
                        placeholder="Password"
                        className="w-full p-3 border border-gray-300 rounded-lg text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password" 
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
