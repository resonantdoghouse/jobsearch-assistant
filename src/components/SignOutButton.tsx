"use client";

import { useFormStatus } from "react-dom";

interface SignOutButtonProps {
  signOutAction: () => Promise<void>;
}

function SubmitButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onClick}
      className="text-sm text-gray-600 hover:text-red-500 font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
    >
      {pending ? "Signing Out..." : "Sign Out"}
    </button>
  );
}

export function SignOutButton({ signOutAction }: SignOutButtonProps) {
  const handleSignOutClick = () => {
    // Clear all local storage
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  };

  return (
    <form action={signOutAction}>
      <SubmitButton onClick={handleSignOutClick} />
    </form>
  );
}
