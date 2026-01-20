import { auth } from "@/auth";
import { getGeminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, userInstructions } = await req.json();

  if (!content || !userInstructions) {
    return NextResponse.json(
      { error: "Missing content or instructions" },
      { status: 400 },
    );
  }

  try {
    const model = getGeminiModel();
    const prompt = `
      You are an expert resume editor. Your task is to modify the provided resume JSON based STRICTLY on the user's instructions.
      
      User Instructions: "${userInstructions}"
      
      Resume Data (JSON):
      ${JSON.stringify(content)}
      
      Rules:
      1. RETURN ONLY THE MODIFIED JSON. Do not include markdown formatting (like \`\`\`json), just the raw JSON string.
      2. Do NOT invent false information. Only modify what is requested.
      3. If the user asks to replace a skill (e.g. C++ to React), ensure you update it in the skills array and potentially in relevant project/experience descriptions if it makes sense contextually, but assume the user knows what they are doing.
      4. Maintain the exact same JSON structure/schema.
      5. If the instructions represent a minor tweak, only tweak that part.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up if markdown code blocks are present despite instructions
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let optimizedContent;
    try {
      optimizedContent = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "AI produced invalid JSON" },
        { status: 500 },
      );
    }

    return NextResponse.json({ content: optimizedContent });
  } catch (error) {
    console.error("Gemini optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize resume" },
      { status: 500 },
    );
  }
}
