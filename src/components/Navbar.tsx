"use client";

import Link from 'next/link';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { usePathname } from 'next/navigation';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function Navbar({ user }: { user?: User }) {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobSearch Assistant
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/resume-review">Resume Review</NavLink>
              <NavLink href="/cover-letter">Cover Letter</NavLink>
              <NavLink href="/dashboard/interview-prep">Interview Prep</NavLink>
              {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">{user.name}</span>
                {user.image ? (
                   <Link href="/dashboard">
                    <img 
                      className="h-8 w-8 rounded-full border border-gray-200" 
                      src={user.image} 
                      alt="" 
                    />
                   </Link>
                ) : (
                  <Link href="/dashboard" className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {user.name?.[0]}
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Simple active state check could be added here if needed via hooks
  return (
    <Link
      href={href}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors"
    >
      {children}
    </Link>
  );
}
