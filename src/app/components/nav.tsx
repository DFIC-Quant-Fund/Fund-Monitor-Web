import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Transition, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { Fragment } from "react";

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
                    <div className="flex space-x-2 sm:space-x-4 items-center">
                        {/* Holdings dropdown */}
                        <Menu as="div" className="relative">
                            <MenuButton
                                className="px-2 py-1 rounded-md text-xs font-bold 
                                    hover:bg-[#600000] transition-colors duration-200
                                    sm:px-3 sm:py-2 sm:text-base"
                            >
                                Holdings
                            </MenuButton>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <MenuItems className="absolute left-0 mt-2 w-40 origin-top-left bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/holdings"
                                                className={`block px-4 py-2 text-sm ${focus ? "bg-[#600000] text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                Basic Holdings
                                            </Link>
                                        )}
                                    </MenuItem>
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/holdings/metrics"
                                                className={`block px-4 py-2 text-sm ${focus ? "bg-[#600000] text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                Holdings Metrics
                                            </Link>
                                        )}
                                    </MenuItem>
                                </MenuItems>
                            </Transition>
                        </Menu>

                        <Link
                            href="/performance"
                            className="px-2 py-1 rounded-md text-xs font-bold 
                hover:bg-[#600000] transition-colors duration-200
                sm:px-3 sm:py-2 sm:text-base"
                        >
                            Performance
                        </Link>
                        <Link
                            href="/transactions"
                            className="px-2 py-1 rounded-md text-xs font-bold 
                hover:bg-[#600000] transition-colors duration-200
                sm:px-3 sm:py-2 sm:text-base"
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
