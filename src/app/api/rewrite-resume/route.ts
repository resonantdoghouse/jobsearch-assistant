import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
      const { originalText, analysis, currentResumeJson, format, answers } = await req.json();

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
    } else if (format === 'ats_optimized') {
        styleInstruction = "MAXIMUM ATS COMPATIBILITY. Single-column layout friendly. Standard standard section headers (Experience, Education, Skills). NO icons. NO creative formatting. Simple, plain, direct text. Emphasize keywords. Use bullet points that are easy to parse.";
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
        3. STRICTLY NO EMOJIS, ICONS, or SPECIAL UNICODE CHARACTERS (like checkmarks, arrows, etc). Use standard text only.
        4. Focus on software engineering and developer standards.
        
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
        You are an expert professional resume writer specializing in Software Engineering and Developer roles.
        Your goal is to rewrite the input resume to be highly effective, ATS-optimized, and professional.

        Original Resume Text:
        ${originalText}
        
        Analysis/Feedback to Apply:${analysis ? `\n${analysis}` : ""}
        ${answers ? `\n\nUser Answers to Previous Questions:\n${JSON.stringify(answers)}` : ""}

        Style Guide:
        ${styleInstruction}
        
        CRITICAL EXECUTION PATH:
        Step 1: Analyze the "Original Resume Text" (and "User Answers" if provided).
        Step 2: Determine if there is enough information to build a STRONG, COMPETITIVE developer resume.
           - a "Strong" resume needs: 
             a) At least 1-2 detailed projects with tech stack.
             b) Clear work experience with some detail (or strong projects if entry level).
             c) A list of technical skills.
        Step 3: 
           - IF MISSING CRITICAL INFO: Do NOT hallucinate. Do NOT invent projects. Return a "questions" JSON object asking the user for the specific missing details.
           - IF SUFFICIENT INFO: Generate the full resume JSON.

        CRITICAL RULES FOR RESUME GENERATION:
        1. Use *only* the information provided.
        2. Do NOT hallucinate or invent any new projects, skills, companies, or degrees.
        3. If you rephrase bullet points, ensure the core facts (metrics, technologies used) remain true. If metrics aren't present, improve verb strength but do NOT invent numbers.
        4. STRICTLY NO EMOJIS, ICONS, or GRAPHICS. Use standard text characters only. This is vital for ATS parsing.
        5. "Summary" should be a professional profile summary, not an objective statement.
        
        SCHEMA 1 (If missing info):
        {
            "questions": [
                "Specific question 1 (e.g., 'Could you provide more details about the tech stack used in the Library Project?')",
                "Specific question 2"
            ]
        }

        SCHEMA 2 (If generating resume):
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
                  "description": ["string (bullet point starting with strong action verb)"]
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
        
        Output strictly valid JSON. Do not include any text outside the JSON block.
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
