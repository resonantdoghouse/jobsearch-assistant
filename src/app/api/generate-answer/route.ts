import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobTitle, company, description, resumeText, question } = await req.json();

    const model = getGeminiModel();
    const prompt = `
      You are an expert career coach helping a candidate draft a sincere, high-quality answer to a specific job application question.

      **Context**:
      - Job application for: ${jobTitle} at ${company}
      - Job Description: ${description}
      - Candidate's Resume: ${resumeText}

      **The Question to Answer**:
      "${question}"

      **Guidelines for the Answer**:
      1. **Tone**: Sincere, enthusiastic, professional, and conversational. Sound like a real person, not an AI.
      2. **Forbidden**: 
         - **NO** em-dashes (—).
         - **NO** AI buzzwords (e.g., "delve", "tapestry", "landscape", "pivotal", "underscores", "rich history", "dynamic", "poster child", "testament").
         - **NO** cliches like "I hope this email finds you well" or "I am thrilled to submit my application".
      3. **Structure**: Answer the question DIRECTLY and IMMEDIATELY. Do not repeat the question.
      4. **Content**: Focus on **value proposition**. Connect the candidate's specific skills and experiences (from the resume) to the specific needs of the role (from the job description).
      5. **Length**: Concise and focused. 1-2 paragraphs max, unless the question implies a longer response.
      6. **Factuality**: Use *only* facts from the resume. Do not invent experiences.

      **Output**:
      Provide only the text of the answer. No intro, no outro, no quotes around it.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({ answer });
  } catch (error: unknown) {
    console.error("Answer generation error:", error);
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate answer" },
      { status }
    );
  }
}
