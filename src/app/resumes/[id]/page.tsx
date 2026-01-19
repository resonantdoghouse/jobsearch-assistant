import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import Link from "next/link";
import { ResumeEditor } from "./ResumeEditor";

export default async function ResumeViewPage({
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

  const resume = await Resume.findOne({ _id: id, userId: user._id }).lean();

  if (!resume) notFound();

  // Serialize resume data for client component
  const serializedResume = {
    _id: resume._id.toString(),
    title: resume.title,
    latestContent: resume.latestContent,
    versions: resume.versions,
    updatedAt: resume.updatedAt.toString(),
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link
        href="/dashboard"
        className="text-gray-500 hover:text-gray-900 mb-6 inline-block"
      >
        &larr; Back to Dashboard
      </Link>
      <div className="flex justify-between items-baseline mb-6">
        <h1 className="text-3xl font-bold">{resume.title}</h1>
        <span className="text-gray-500 text-sm">
          Saved on {new Date(resume.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <ResumeEditor resume={serializedResume} />
    </div>
  );
}
