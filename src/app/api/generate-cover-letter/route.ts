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
      1. **Tone**: Use a direct, conversational, and professional tone. Write as a human, not a machine.
      2. **Forbidden**: Do NOT use em-dashes (—). Do NOT use buzzwords like "delve", "testament", "tapestry", "landscape", "pivotal", "underscores", "rich history", "dynamic", "poster child".
      3. **Structure**: Vary your sentence length. Use short, punchy sentences. Avoid starting every paragraph with "I am writing to...".
      4. **Content**: Focus heavily on *value*. How can I solve their problems? Connect my specific skills to their specific needs.
      5. **Authenticity**: Express genuine interest.
      6. **Length**: Keep it under 250 words.
      7. **Factuality**: Use *only* the facts from "My Resume/Background". Do not hallucinate experiences.
      8. **Formatting**: Return plain text with paragraph breaks. No "Subject:" lines or placeholder contact info at the top unless explicitly asked. Just the body of the letter.

    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    return NextResponse.json({ coverLetter });
  } catch (error: unknown) {
    console.error("Cover letter generation error:", error);
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate cover letter" },
      { status }
    );
  }
}
