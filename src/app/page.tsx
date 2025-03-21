"use client"; // Ensure this is a Client Component

import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

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
            </div>
        </div>
    );
}
