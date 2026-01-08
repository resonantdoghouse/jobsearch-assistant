import { auth } from "@/auth";
import { LoginPrompt } from "@/components/LoginPrompt";
import { ResumeReviewClient } from "./ResumeReviewClient";

export default async function ResumeReviewPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <LoginPrompt
        title="AI-Powered Resume Review"
        description="Get instant, actionable feedback on your resume to increase your chances of landing developer interviews. Sign in to analyze your resume with our advanced AI model."
      />
    );
  }

  return <ResumeReviewClient />;
}
