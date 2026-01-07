import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobTitle, company, description, resumeText } = await req.json();

    const model = getGeminiModel();
    const prompt = `
      You are an expert professional writer.
      Write a compelling cover letter for the following role:
      
      Job Title: ${jobTitle}
      Company: ${company}
      Job Description: ${description}
      
      My Resume/Background:
      ${resumeText}
      
      The tone should be professional, enthusiastic, and tailored to the specific job requirements mentioned.
      Highlight relevant skills from my resume that match the job description.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
