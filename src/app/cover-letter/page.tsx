import { auth } from "@/auth";
import { LoginPrompt } from "@/components/LoginPrompt";
import { CoverLetterClient } from "./CoverLetterClient";

export default async function CoverLetterPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <LoginPrompt
        title="Smart Cover Letter Generator"
        description="Generate tailored cover letters for every job application in seconds. Sign in to create and save your cover letters."
      />
    );
  }

  return <CoverLetterClient />;
}
