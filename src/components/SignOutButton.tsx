"use client";

import { useTransition } from "react";

interface SignOutButtonProps {
  signOutAction: () => Promise<void>;
}

export function SignOutButton({ signOutAction }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    // Clear all local storage
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }

    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="text-sm text-gray-600 hover:text-red-500 font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
    >
      {isPending ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
