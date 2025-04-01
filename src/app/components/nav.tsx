import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
    const router = useRouter();
    return (
        <nav className="bg-[#800000] text-white shadow-lg sticky top-0 z-50">
            <div className="mx-auto px-2 sm:px-18">
                <div className="flex justify-between items-center h-22 sm:h-22 py-2 sm:py-0">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/dfic-logo.png"
                            alt="DFIC Logo"
                            width={150}
                            height={150}
                            className="rounded-lg"
                        />
                    </Link>

                    {/* Navigation */}
                    <div className="flex space-x-2 sm:space-x-4">
                        <Link
                            href="/holdings"
                            className="
                                px-2 py-1 rounded-md text-xs font-bold 
                                hover:bg-[#600000] transition-colors duration-200
                                sm:px-3 sm:py-2 sm:text-base
                            "
                        >
                            Holdings
                        </Link>
                        <Link
                            href="/performance"
                            className="
                                px-2 py-1 rounded-md text-xs font-bold 
                                hover:bg-[#600000] transition-colors duration-200
                                sm:px-3 sm:py-2 sm:text-base
                            "
                        >
                            Performance
                        </Link>
                        <Link
                            href="/transactions"
                            className="
                                px-2 py-1 rounded-md text-xs font-bold 
                                hover:bg-[#600000] transition-colors duration-200
                                sm:px-3 sm:py-2 sm:text-base
                            "
                        >
                            Transactions
                        </Link>
                    </div>

                    <Link
                        href="/login"
                        onClick={() => {
                            localStorage.removeItem("auth");
                            router.push("/login");
                        }}
                        className="
                            px-2 py-1 rounded-md text-xs font-bold 
                            hover:bg-[#600000] transition-colors duration-200
                            sm:px-3 sm:py-2 sm:text-base
                        "
                    >
                        Logout
                    </Link>
                </div>
            </div>
        </nav>
    );
}
