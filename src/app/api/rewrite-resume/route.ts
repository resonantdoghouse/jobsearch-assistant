import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalText, analysis, currentResumeJson } = await req.json();

    const model = getGeminiModel();
    const isRefinement =
      originalText === undefined && currentResumeJson !== undefined;

    let prompt = "";

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
