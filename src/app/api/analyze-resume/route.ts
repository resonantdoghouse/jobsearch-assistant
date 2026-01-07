import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import mammoth from "mammoth";
// Placeholder for PDF parser import
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let text = "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === "application/pdf") {
      text = await extractTextFromPDF(buffer);
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
        // Fallback for plain text or markdown
        text = buffer.toString('utf-8');
    }

    const model = getGeminiModel();
      const prompt = `
      You are an expert technical recruiter and senior software engineer. 
      Review the following resume for a developer role. 
      Provide feedback in markdown format. 
      Do NOT wrap your response in a code block (e.g. \`\`\`markdown ... \`\`\`). Return raw markdown.
      
      Focus on:
      1. Technical Skills relevance (Use bullet points)
      2. Project descriptions (Are they using STAR method?)
      3. Global Formatting and Readability
      4. ATS Optimization Tips (Keywords to add/remove)

      Make the output structured with clear Headings (use ## for main sections, ### for subsections).

      Resume Content:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    // Auto-save if user is logged in
    const session = await auth();
    if (session?.user?.email) {
      try {
        await dbConnect();
        // Dynamically import User to ensure model is registered
        const User = (await import("mongoose")).models.User || (await import("mongoose")).model("User", new (await import("mongoose")).Schema({}));
        const user = await User.findOne({ email: session.user.email });

        if (user) {
          await ResumeAnalysis.create({
            userId: user._id,
            fileName: file.name,
            originalText: text,
            analysis: analysis
          });
        }
      } catch (saveError) {
        console.error("Failed to auto-save analysis:", saveError);
        // Don't fail the response if save fails, just log it.
      }
    }

    return NextResponse.json({ analysis, extractedText: text });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
