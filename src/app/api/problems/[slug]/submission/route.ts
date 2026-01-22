
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Submission from "@/lib/db/models/Submission";
import Problem from "@/lib/db/models/Problem";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
       return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    await dbConnect();
    
    // First find the problem ID from the slug
    // Note: If using mock data for problems not in DB, this might fail if we enforce DB relation.
    // However, for saving submissions we likely need the problem to be valid in DB or at least have an ID.
    // For this MVP, we rely on the `Problem` model.
    const problem = await Problem.findOne({ slug });
    
    // If the problem doesn't exist in DB (e.g. it's a mock-only problem that hasn't been synced),
    // we might need to handle that. But let's assume valid problem IDs are passed.
    if (!problem) {
        // If we can't find the problem by slug in DB, we can't find submissions by problem reference easily
        // unless we store slug in submission, which we don't.
        // For MVP: assume problem exists.
        return NextResponse.json({ success: false, error: "Problem not found" }, { status: 404 });
    }

    const submission = await Submission.findOne({
        userId,
        problemId: problem._id
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, submission });

  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
