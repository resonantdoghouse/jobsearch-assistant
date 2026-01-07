import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import { ResumePreview } from "@/components/ResumePreview";
import Link from "next/link";

export default async function ResumeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  await dbConnect();

  const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
  const user = await User.findOne({ email: session.user.email });

  if (!user) redirect("/login");

  const resume = await Resume.findOne({ _id: id, userId: user._id });

  if (!resume) notFound();

  let content;
  try {
      content = JSON.parse(resume.latestContent);
  } catch {
      content = resume.latestContent;
  }

  // Get latest analysis if available from versions
  const latestVersion = resume.versions && resume.versions.length > 0 ? resume.versions[resume.versions.length - 1] : null;
  const analysis = latestVersion?.feedback;

  return (
    <div className="max-w-4xl mx-auto pb-12">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 mb-6 inline-block">&larr; Back to Dashboard</Link>
        <div className="flex justify-between items-baseline mb-6">
            <h1 className="text-3xl font-bold">{resume.title}</h1>
            <span className="text-gray-500 text-sm">Saved on {new Date(resume.updatedAt).toLocaleDateString()}</span>
        </div>
        
        <ResumePreview content={content} analysis={analysis} />
    </div>
  );
}
