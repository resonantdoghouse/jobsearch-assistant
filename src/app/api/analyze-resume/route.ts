import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import mammoth from "mammoth";
// Placeholder for PDF parser import
import { extractTextFromPDF } from "@/lib/pdf-utils";

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
      Focus on:
      1. Technical Skills relevance
      2. Project descriptions (STAR method?)
      3. formatting and readability
      4. ATS optimization tips.
      
      Resume Content:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
