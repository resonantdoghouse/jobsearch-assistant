import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API Key found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
     // For listing models, we might need to use the model manager if exposed, 
     // but the SDK usually simplifies this. 
     // Actually, standard AI SDK might not have listModels easily exposed on the main instance?
     // It typically does via `genAI.getGenerativeModel`... wait, how to list?
     // It seems the SDK doesn't expose `listModels` directly in the top-level class in all versions.
     // I'll try to just infer it or look at the error message again.
     // The error message: "Call ListModels to see the list..."
     // I'll try to use a REST call if SDK fails, or just try 'gemini-pro'.
     
     // Let's try to just output what models trigger 404.
     // I'll try to fetch a dummy generation with 'gemini-1.5-flash-8b' or similar if flash fails.
     console.log("Testing model: gemini-1.5-flash");
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
     await model.generateContent("Test");
     console.log("Success with gemini-1.5-flash");
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Error with gemini-1.5-flash:", errorMessage);
    
    // Fallback: try querying specific models if I can't list
    const candidates = ["gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-1.0-pro", "gemini-pro"];
    for (const name of candidates) {
        try {
            console.log(`Testing model: ${name}`);
            const model = genAI.getGenerativeModel({ model: name });
            await model.generateContent("Test");
            console.log(`Success with ${name}!`);
            break;
        } catch (err: unknown) {
            const errLimit = err instanceof Error ? err.message.split(':')[0] : String(err);
            console.log(`Failed ${name}: ${errLimit}`);
        }
    }
  }
}

listModels();
