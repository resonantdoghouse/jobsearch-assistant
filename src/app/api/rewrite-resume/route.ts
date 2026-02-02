import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalText, analysis, currentResumeJson, format } = await req.json();

    const model = getGeminiModel();
    const isRefinement =
      originalText === undefined && currentResumeJson !== undefined;

    let prompt = "";

    // Define style instructions based on format
    let styleInstruction = "Standard professional tone. Focus on clarity and ATS optimization.";
    if (format === 'professional') {
        styleInstruction = "Strictly formal, traditional professional tone. Use strong action verbs. Avoid buzzwords. Focus heavily on quantifiable achievements and traditional corporate language.";
    } else if (format === 'modern') {
         styleInstruction = "Clean, concise, and modern. Emphasize latest tech skills and impact. Use crisp, punchy language.";
    }

    if (isRefinement) {
      prompt = `
        You are an expert professional resume writer.
        You have a resume in JSON format and a specific instruction to update it.
        
        Current Resume (JSON):
        ${JSON.stringify(currentResumeJson)}
        
        Refinement Instruction:
        ${analysis} 
        (Note: "analysis" here contains the user's specific instruction for refinement)
        
        Task:
        Update the resume JSON based strictly on the Refinement Instruction. 
        Keep all other information exactly the same unless the instruction implies changing it or if it requires correcting a clear error associated with the instruction.
        
        CRITICAL RULES:
        1. Do NOT invent new projects, skills, or experiences that are not in the Current Resume or explicitly requested in the Refinement Instruction.
        2. Maintain the truthfulness of the original document. Only rephrase or restructure existing facts.
        3. DO NOT use emojis, icons, or special unicode characters (like checkmarks) in the content strings.
        
        Output strictly valid JSON matching the same schema as the input.
        Do not include any text outside the JSON block.
      `;
    } else {
      // Original Generation Flow
      if (!originalText) {
        return NextResponse.json(
          { error: "Original text is required for initial generation" },
          { status: 400 }
        );
      }

      prompt = `
        You are an expert professional resume writer.
        Rewrite the following resume to be more effective for developer roles, applying the feedback provided in the analysis.
        
        Original Resume Text:
        ${originalText}
        
        Analysis/Feedback to Apply:
        ${
          analysis ||
          "General improvements for clarity, impact, and ATS optimization."
        }

        Style Guide:
        ${styleInstruction}
        
        CRITICAL RULES:
        1. Use *only* the information provided in the "Original Resume Text".
        2. Do NOT hallucinate or invent any new projects, skills, employment history, or degrees.
        3. If you rephrase bullet points, ensure the core facts (metrics, technologies used) remain true to the source.
        4. If the Analysis/Feedback asks to "add metrics", only add placeholders if the data isn't there, or better yet, just improve the verb strength without inventing numbers.
        5. DO NOT use emojis, icons, or special unicode characters (like checkmarks) in the content strings. Keep it text-only for ATS compatibility.
        
        Output strictly valid JSON matching this schema:
        {
          "fullName": "string",
          "contactInfo": {
              "email": "string",
              "phone": "string",
              "location": "string", 
              "linkedin": "string (optional)",
              "website": "string (optional)"
          },
          "summary": "string (professional summary)",
          "skills": {
              "languages": ["string"],
              "frameworks": ["string"],
              "tools": ["string"],
              "other": ["string"]
          },
          "experience": [
              {
                  "role": "string",
                  "company": "string",
                  "duration": "string",
                  "description": ["string (bullet point starting with action verb)"]
              }
          ],
          "education": [
              {
                  "degree": "string",
                  "school": "string",
                  "year": "string"
                  // Do NOT invent a GPA if not provided
              }
          ],
          "projects": [
              {
                  "name": "string",
                  "description": "string",
                  "techStack": ["string"]
              }
          ]
        }
        Do not include any text outside the JSON block.
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON
    let jsonString = text;
    // Remove markdown code blocks if present
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) {
      jsonString = match[1];
    } else {
      // Fallback: try to find first { and last }
      const firstOpen = text.indexOf("{");
      const lastClose = text.lastIndexOf("}");
      if (firstOpen !== -1 && lastClose !== -1) {
        jsonString = text.substring(firstOpen, lastClose + 1);
      }
    }

    try {
      const rewrittenContent = JSON.parse(jsonString);
      return NextResponse.json({ rewrittenContent });
    } catch (e) {
      console.error("Failed to parse JSON", e);
      return NextResponse.json(
        { error: "Failed to parse generated resume JSON" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resume rewrite error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite resume" },
      { status: 500 }
    );
  }
}
