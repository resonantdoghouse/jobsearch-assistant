
import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import CoverLetter from "@/lib/db/models/CoverLetter";
import Resume from "@/lib/db/models/Resume";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id, isStarred } = await req.json();

    await dbConnect();

    // Verify User Ownership (using inline model as in delete-item)
    const User =
      (await import("mongoose")).models.User ||
      (await import("mongoose")).model(
        "User",
        new (await import("mongoose")).Schema({}),
      );
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updatedItem;

    if (type === "resume") {
      updatedItem = await Resume.findOneAndUpdate(
        { _id: id, userId: user._id },
        { isStarred },
        { new: true },
      );
    } else if (type === "analysis") {
      updatedItem = await ResumeAnalysis.findOneAndUpdate(
        { _id: id, userId: user._id },
        { isStarred },
        { new: true },
      );
    } else if (type === "cover-letter") {
      updatedItem = await CoverLetter.findOneAndUpdate(
        { _id: id, userId: user._id },
        { isStarred },
        { new: true },
      );
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error toggling star:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
