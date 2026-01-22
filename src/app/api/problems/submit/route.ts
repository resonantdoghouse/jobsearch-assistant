
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Submission from "@/lib/db/models/Submission";
// import { auth } from "@/auth"; // Assuming auth helper exists or similar

// TODO: Implement proper auth check. 
// For now, if we don't have auth helper, we'll need to mock or find how existing code handles it.
// I'll assume standard next-auth usage.

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const { problemId, code, language, status, executionTime, userId, score, timeComplexity, spaceComplexity } = body;

    // TODO: Use real user ID from session. For now, accepting userId from body for testing if necessary, 
    // but in prod should be session.user.id
    
    // Validate required
    if (!problemId || !code || !language || !status || !userId) {
         return NextResponse.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
        );
    }

    const submission = await Submission.create({
      userId, 
      problemId,
      code,
      language,
      status,
      executionTime,
      score,
      timeComplexity,
      spaceComplexity
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("Error submitting solution:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit solution" },
      { status: 500 }
    );
  }
}
