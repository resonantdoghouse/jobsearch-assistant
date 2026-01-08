import { auth, signOut } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { LoginPrompt } from "@/components/LoginPrompt";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";
import CoverLetter from "@/lib/db/models/CoverLetter";
import { DashboardClient } from "./DashboardClient";

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
      new (await import("mongoose")).Schema({})
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
  const [resumes, analyses, coverLetters] = await Promise.all([
    Resume.find({ userId: user._id }).sort({ updatedAt: -1 }).lean(),
    ResumeAnalysis.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
    CoverLetter.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SignOutButton
          signOutAction={async () => {
            "use server";
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();

            // Explicitly clear all potential auth cookies
            const cookiesToDelete = [
              "authjs.session-token",
              "__Secure-authjs.session-token",
              "next-auth.session-token",
              "__Secure-next-auth.session-token",
              "authjs.csrf-token",
              "__Host-authjs.csrf-token",
            ];

            cookiesToDelete.forEach((name) => {
              cookieStore.delete(name);
            });

            await signOut({ redirectTo: "/" });
          }}
        />
      </div>

      <DashboardClient
        user={session.user}
        resumes={JSON.parse(JSON.stringify(resumes))}
        analyses={JSON.parse(JSON.stringify(analyses))}
        coverLetters={JSON.parse(JSON.stringify(coverLetters))}
      />
    </div>
  );
}
