import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import SavedJob from "@/lib/db/models/SavedJob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get User ID
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

    const body = await req.json();
    const { id, title, company, location, link, source, date, score, matchReason } = body;

    if (!id || !title || !link) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if already saved
    const existingJob = await SavedJob.findOne({
      userId: user._id,
      jobId: id,
    });

    if (existingJob) {
       // Already saved, maybe return success or specific message
       return NextResponse.json({ message: "Job already saved", savedJob: existingJob }, { status: 200 });
    }

    const newSavedJob = await SavedJob.create({
      userId: user._id,
      jobId: id,
      title,
      company,
      location,
      link,
      source,
      date,
      score,
      matchReason,
    });

    return NextResponse.json({ message: "Job saved successfully", savedJob: newSavedJob }, { status: 201 });

  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        await dbConnect();
    
        // Get User ID
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

        const savedJobs = await SavedJob.find({ userId: user._id }).select("jobId");
        const savedJobIds = savedJobs.map((job) => job.jobId);

        return NextResponse.json({ savedJobIds }, { status: 200 });

    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
    }
}
