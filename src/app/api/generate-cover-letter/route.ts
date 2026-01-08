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
      You are an expert career coach and professional writer.
      Write a concise, engaging, and human-sounding cover letter for the following role.
      
      Job Title: ${jobTitle}
      Company: ${company}
      Job Description: ${description}
      
      My Resume/Background:
      ${resumeText}
      
      Guidelines:
      1. Be concise and to the point. Avoid fluff.
      2. Do NOT sound like an AI. Use natural, professional, yet conversational language.
      3. Focus heavily on how I can bring specific value to ${company} based on my experience.
      4. Express genuine passion and interest in the company and role.
      5. Do not simply summarize the resume; connect the dots between my skills and the job needs.
      6. Keep it under 300 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error("Cover letter generation error:", error);
    const status = error.status || 500;
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter" },
      { status }
    );
  }
}
