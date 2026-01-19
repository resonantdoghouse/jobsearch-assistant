import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import CoverLetter from "@/lib/db/models/CoverLetter";
import Link from "next/link";
import { CoverLetterEditor } from "@/components/CoverLetterEditor";

export default async function CoverLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  await dbConnect();

  const User =
    (await import("mongoose")).models.User ||
    (await import("mongoose")).model(
      "User",
      new (await import("mongoose")).Schema({}),
    );
  const user = await User.findOne({ email: session.user.email });

  if (!user) redirect("/login");

  const coverLetter = await CoverLetter.findOne({ _id: id, userId: user._id });

  if (!coverLetter) notFound();

  // Serializing for client component
  const serializedCoverLetter = {
    _id: coverLetter._id.toString(),
    jobDescription: coverLetter.jobDescription,
    content: coverLetter.content,
    createdAt: coverLetter.createdAt.toString(),
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-gray-900 mb-6 inline-block"
      >
        &larr; Back to Dashboard
      </Link>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Cover Letter for:{" "}
          <span className="text-gray-600 font-normal">
            {coverLetter.jobDescription
              ? coverLetter.jobDescription.substring(0, 50) + "..."
              : "Untitled Position"}
          </span>
        </h1>
        <span className="text-gray-500 text-sm">
          Created on {new Date(coverLetter.createdAt).toLocaleDateString()}
        </span>
      </div>

      <CoverLetterEditor coverLetter={serializedCoverLetter} />
    </div>
  );
}
