import { auth, signOut } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";
import CoverLetter from "@/lib/db/models/CoverLetter";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
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
    redirect("/login");
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
              "use server"
              await signOut({ redirectTo: "/" })
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
