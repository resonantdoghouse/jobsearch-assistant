
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import Submission from "@/lib/db/models/Submission";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const submissions = await Submission.find({ 
        userId: user._id, 
        status: "Accepted" 
    }).select("problemId");

    return NextResponse.json({ success: true, submissions });

  } catch (error) {
    console.error("Error fetching solved submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
