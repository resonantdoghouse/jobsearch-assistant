import { auth } from "@/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const { content, title } = data;

    await dbConnect();
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

    const resume = await Resume.findOne({
      _id: id,
      userId: user._id,
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Update fields
    if (content) {
      if (typeof content === "object") {
        resume.latestContent = JSON.stringify(content);
      } else {
        resume.latestContent = content;
      }
    }

    if (title) {
      resume.title = title;
    }

    await resume.save();

    return NextResponse.json({
      message: "Resume updated successfully",
      resume,
    });
  } catch (error) {
    console.error("Resume update error:", error);
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 },
    );
  }
}
