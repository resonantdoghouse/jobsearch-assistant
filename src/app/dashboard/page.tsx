import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { LoginPrompt } from "@/components/LoginPrompt";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";
import CoverLetter from "@/lib/db/models/CoverLetter";
import Submission from "@/lib/db/models/Submission";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <LoginPrompt
        title="Your Career Dashboard"
        description="Track your resumes, cover letters, and application progress in one place. Sign in to view your dashboard."
      />
    );
  }

  await dbConnect();

  // Fetch User ID
  const User =
    (await import("mongoose")).models.User ||
    (await import("mongoose")).model(
      "User",
      new (await import("mongoose")).Schema({}),
    );
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    // Edge case: Session exists but user not in DB (shouldn't happen often with correct auth flow)
    return (
      <LoginPrompt
        title="Account Not Found"
        description="We couldn't find your account details. Please try signing in again."
      />
    );
  }

  // Fetch Data in parallel
  const [resumes, analyses, coverLetters, submissions] = await Promise.all([
    Resume.find({ userId: user._id }).sort({ updatedAt: -1 }).lean(),
    ResumeAnalysis.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
    CoverLetter.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
    Submission.find({ userId: user._id, status: "Accepted" })
      .populate("problemId", "title slug difficulty")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  console.log(
    "Debug Resumes Starred Status:",
    resumes.map((r: any) => ({ id: r._id, starred: r.isStarred })),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton />
      </div>

      <DashboardClient
        user={session.user}
        resumes={JSON.parse(JSON.stringify(resumes))}
        analyses={JSON.parse(JSON.stringify(analyses))}
        coverLetters={JSON.parse(JSON.stringify(coverLetters))}
        submissions={JSON.parse(JSON.stringify(submissions))}
      />
    </div>
  );
}
