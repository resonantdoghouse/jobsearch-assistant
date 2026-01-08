import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import CoverLetter from "@/lib/db/models/CoverLetter";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Verify user exists
    const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content, jobDescription, jobTitle, company } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Create the cover letter
    // We store jobTitle and Company in jobDescription field for now as a composite string or just description
    // The schema has jobDescription. Let's try to store a combined string if we want title visible
    // Or just store the description.Ideally we update the schema, but I'll stick to the existing schema to avoid drift.
    // Let's format the "title" for the dashboard as "Job Title at Company" if possible, but the schema uses `jobDescription`.
    // I will prepend the title/company to description so it shows up in dashboard if it uses that field for the title.
    
    let descriptionToSave = jobDescription;
    if (jobTitle && company) {
        descriptionToSave = `${jobTitle} at ${company} - ${jobDescription ? jobDescription.substring(0, 50) : ""}...`;
    } else if (jobTitle) {
        descriptionToSave = `${jobTitle} - ${jobDescription ? jobDescription.substring(0, 50) : ""}...`;
    }

    const newCoverLetter = await CoverLetter.create({
      userId: user._id,
      content: content,
      jobDescription: descriptionToSave || "Untitled Cover Letter", 
    });

    return NextResponse.json({ success: true, id: newCoverLetter._id }, { status: 201 });

  } catch (error) {
    console.error("Error saving cover letter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
