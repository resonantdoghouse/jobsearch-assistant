import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import ProblemClient from "./ProblemClient";
// import { redirect } from "next/navigation"; // Optional: redirect if not logged in

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!session?.user?.email) {
    // Handle unauthenticated state - maybe show a message or redirect
    return (
      <div className="p-8 text-center text-red-500">
        Please sign in to practice problems.
      </div>
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
    return <div className="p-8 text-center text-red-500">User not found.</div>;
  }

  return <ProblemClient slug={slug} userId={user._id.toString()} />;
}
