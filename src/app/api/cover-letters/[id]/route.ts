import { auth } from "@/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import CoverLetter from "@/lib/db/models/CoverLetter";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const coverLetter = await CoverLetter.findOne({
      _id: id,
      userId: user._id,
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Fetch cover letter error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cover letter" },
      { status: 500 },
    );
  }
}

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
    const { content } = data;

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

    const coverLetter = await CoverLetter.findOne({
      _id: id,
      userId: user._id,
    });

    if (!coverLetter) {
      return NextResponse.json(
        { error: "Cover letter not found" },
        { status: 404 },
      );
    }

    if (content) {
      coverLetter.content = content;
    }

    await coverLetter.save();

    return NextResponse.json({
      message: "Cover letter updated successfully",
      coverLetter,
    });
  } catch (error) {
    console.error("Cover letter update error:", error);
    return NextResponse.json(
      { error: "Failed to update cover letter" },
      { status: 500 },
    );
  }
}
