import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import Resume from "@/lib/db/models/Resume";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";
import CoverLetter from "@/lib/db/models/CoverLetter";
import SavedJob from "@/lib/db/models/SavedJob";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, id } = body;

        if (!id || !type) {
            return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
        }

        await dbConnect();
        
        // Verify User Ownership
        const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
        const user = await User.findOne({ email: session.user.email });
        
        if (!user) {
             return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let deleted;

        if (type === 'resume') {
            deleted = await Resume.findOneAndDelete({ _id: id, userId: user._id });
        } else if (type === 'analysis') {
            deleted = await ResumeAnalysis.findOneAndDelete({ _id: id, userId: user._id });
        } else if (type === 'cover-letter') {
            deleted = await CoverLetter.findOneAndDelete({ _id: id, userId: user._id });
      } else if (type === "saved-job") {
        deleted = await SavedJob.findOneAndDelete({ _id: id, userId: user._id });
      } else {
        return NextResponse.json(
          { error: "Invalid item type" },
          { status: 400 },
        );
      }
      
      if (!deleted) {
            return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true, id: deleted._id });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
