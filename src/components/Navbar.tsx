"use client";

import { useState } from "react";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { usePathname } from "next/navigation";

import Image from "next/image";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function Navbar({ user }: { user?: User }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/85 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  JS
                </div>
                <span className="text-xl font-bold text-[#0a66c2] tracking-tight">
                  JobSearch
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <NavLink href="/resume-review">Resume Review</NavLink>
              <NavLink href="/cover-letter">Cover Letter</NavLink>
              <NavLink href="/jobs">Find Jobs</NavLink>
              <NavLink href="/dashboard/interview-prep">Interview Prep</NavLink>
              {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-900">
                  {user.name}
                </span>
                {user.image ? (
                  <Link href="/dashboard" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
                    <Image
                      className="relative rounded-full border-2 border-white dark:border-zinc-900"
                      src={user.image}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                    />
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 ring-2 ring-transparent hover:ring-indigo-500 transition-all"
                  >
                    {user.name?.[0]}
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-indigo-500/30 transition-all duration-200"
              >
                Sign in
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed. */}
              {/* Heroicon name: outline/menu */}
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open. */}
              {/* Heroicon name: outline/x */}
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden border-t border-gray-200 bg-white`}>
        <div className="pt-2 pb-3 space-y-1">
          <MobileNavLink href="/resume-review" onClick={() => setIsOpen(false)}>Resume Review</MobileNavLink>
          <MobileNavLink href="/cover-letter" onClick={() => setIsOpen(false)}>Cover Letter</MobileNavLink>
          <MobileNavLink href="/jobs" onClick={() => setIsOpen(false)}>Find Jobs</MobileNavLink>
          <MobileNavLink href="/dashboard/interview-prep" onClick={() => setIsOpen(false)}>Interview Prep</MobileNavLink>
          {user && <MobileNavLink href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileNavLink>}
        </div>
        <div className="pt-4 pb-4 border-t border-gray-200">
          {user ? (
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {user.image ? (
                  <Image
                    className="h-10 w-10 rounded-full"
                    src={user.image}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user.name?.[0]}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.name}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
          ) : (
             <div className="px-4">
                <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                Sign in
              </Link>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function MobileNavLink({
    href,
    children,
    onClick
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
      >
        {children}
      </Link>
    );
  }

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border-b-2 border-transparent hover:border-gray-900"
    >
      {children}
    </Link>
  );
}
