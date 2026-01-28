import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import mammoth from "mammoth";
// Placeholder for PDF parser import
import { extractTextFromPDF } from "@/lib/pdf-utils";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/connect";
import ResumeAnalysis from "@/lib/db/models/ResumeAnalysis";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

      Task:
      1. Analyze the resume provided below for a developer role.
      2. Extract the resume content into a structured JSON format.

      Resume Content:
      ${text}

      Output Requirements:
      Return a single valid JSON object with exactly two keys: "analysis" and "structuredResume".

      "analysis": A string containing your detailed feedback in Markdown format. Use ## for main sections. Focus on Technical Skills relevance, Project descriptions (STAR method), Formatting, and ATS Optimization.

      "structuredResume": A JSON object representing the resume content, matching this schema:
      {
          "fullName": "string",
          "contactInfo": { "email": "string", "phone": "string", "location": "string", "linkedin": "string", "website": "string" },
          "summary": "string",
          "skills": { "languages": ["string"], "frameworks": ["string"], "tools": ["string"] },
          "experience": [{ "role": "string", "company": "string", "duration": "string", "description": ["string"] }],
          "education": [{ "degree": "string", "school": "string", "year": "string" }],
          "projects": [{ "name": "string", "description": "string", "techStack": ["string"] }]
      }

      Return ONLY the JSON object. Do not include markdown formatting or code blocks around the JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    let jsonResponse;
    try {
        // clean up potential markdown code blocks
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        jsonResponse = JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to parse Gemini response", e);
        // Fallback if JSON parsing fails - return just analysis as plain text if possible, or error
        // But for this feature to work, we really need the JSON.
        return NextResponse.json({ error: "Failed to process resume data" }, { status: 500 });
    }

    const { analysis, structuredResume } = jsonResponse;

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

    return NextResponse.json({ analysis, structuredResume, extractedText: text });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
