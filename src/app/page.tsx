"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./loading";

export default function Home() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Start with null to represent loading

    useEffect(() => {
        const auth = localStorage.getItem("auth");
        if (!auth) {
            router.push("/login");
        } else {
            setIsAuthenticated(true);
        }
    }, []);

    // While authentication status is loading, show a loading message
    if (isAuthenticated === null){
      return (
        <>
          <Loading />
        </>
      )
    } 

    // Once authenticated, render the home page
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <h1 className="text-[#800000] text-6xl font-bold mb-6">DFIC</h1>
            <div className="flex flex-col space-y-4">
                <button 
                    onClick={() => router.push("/holdings")}
                    className="bg-[#800000] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#600000] transition cursor-pointer"
                >
                    Holdings
                </button>
                <button 
                    onClick={() => router.push("/performance")}
                    className="bg-[#800000] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#600000] transition cursor-pointer"
                >
                    Performance
                </button>
                <button 
                    disabled
                    className="bg-gray-400 text-white px-6 py-3 rounded-lg text-lg font-semibold cursor-not-allowed"
                >
                    Transactions (Coming Soon)
                </button>
                <button 
                    onClick={() => {
                        localStorage.removeItem("auth");
                        router.push("/login");
                    }}
                    className="bg-[#800000] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-[#600000] transition cursor-pointer"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
