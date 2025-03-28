import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <nav className="bg-[#800000] text-white shadow-lg">
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
                cursor-not-allowed opacity-50
                sm:px-3 sm:py-2 sm:text-base
              "
                            onClick={(e) => {
                                e.preventDefault(); // disabled navigation for now
                            }}
                            aria-disabled="true"
                        >
                            Transactions
                        </Link>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => {
                            // logout functionality
                        }}
                        className="
              hidden sm:inline-block
              px-3 py-2 rounded-md text-base font-bold 
              hover:bg-[#600000] transition-colors duration-200
            "
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
