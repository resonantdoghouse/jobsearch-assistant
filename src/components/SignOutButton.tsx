"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  const handleSignOut = async () => {
    // Clear local storage just in case
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    await signOut({ callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-600 hover:text-red-500 font-medium px-4 py-2 rounded transition-colors"
    >
      Sign Out
    </button>
  );
}
