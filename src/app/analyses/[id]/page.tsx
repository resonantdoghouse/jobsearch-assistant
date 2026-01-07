import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";
import { ReviewResult } from "@/components/ReviewResult";
import Link from "next/link";

export default async function AnalysisViewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  await dbConnect();

  const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
  const user = await User.findOne({ email: session.user.email });

  if (!user) redirect("/login");

  const analysisRecord = await ResumeAnalysis.findOne({ _id: id, userId: user._id });

  if (!analysisRecord) notFound();

  return (
    <div className="max-w-4xl mx-auto pb-12">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 mb-6 inline-block">&larr; Back to Dashboard</Link>
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
            <p className="text-gray-600">
                File: <span className="font-semibold">{analysisRecord.fileName || "Uploaded Resume"}</span> • {new Date(analysisRecord.createdAt).toLocaleDateString()}
            </p>
        </div>
        
        <ReviewResult analysis={analysisRecord.analysis} />
        
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold mb-4">Original Extracted Text</h3>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto text-gray-700">
                {analysisRecord.originalText}
            </div>
        </div>
    </div>
  );
}
