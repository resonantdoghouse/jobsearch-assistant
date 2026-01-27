import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the user by email to get their ObjectId (if Resume model requires ObjectId ref)
    // Or we can rely on how NextAuth + Adapter stores users.
    // However, since we used the Mongoose Adapter, `session.user.id` might be available if we configured the session callback.
    // The standard NextAuth session doesn't always have ID.
    // Let's assume for now we look up user by email if ID is missing or trust the adapter.
    
    // Actually, let's fetch the User ID from the database using the email to be safe,
    // unless we are sure `session.user.id` is populated.
    // For simplicity, let's assume we can query Resumes by userId.
    // We need the User model to find the ID.
    const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate input using Zod
    const { z } = await import("zod");
    const resumeSchema = z.object({
      title: z.string().optional(),
      content: z.record(z.string(), z.any()), // Validate as object, refine based on ResumeData structure if possible
      analysis: z.string().optional(),
    });

    const body = await req.json();
    const result = resumeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { title, content, analysis } = result.data;

    // Check if we are updating an existing resume (by ID) or creating a new one
    // For MVP, let's just create a new one every time the user hits "Save", or we could handle "Update".
    // The user request was "save", implies saving a new copy or version.
    // Let's create a new document for now.

    const newResume = await Resume.create({
      userId: user._id,
      title: title || "Untitled Resume",
      latestContent: JSON.stringify(content),
      versions: [
        {
          content: JSON.stringify(content),
          feedback: analysis || "",
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ success: true, id: newResume._id }, { status: 201 });

  } catch (error) {
    console.error("Error saving resume:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        await dbConnect();
        
        const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
       }

        const resumes = await Resume.find({ userId: user._id }).sort({ updatedAt: -1 });

        return NextResponse.json({ resumes }, { status: 200 });

    } catch (error: unknown) {
        console.error("Error fetching resumes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
