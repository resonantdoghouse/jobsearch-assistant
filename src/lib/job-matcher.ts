import { Job } from './scrapers';
import { getGeminiModel } from './gemini';

export async function scoreJobsWithGemini(resumeContent: string, jobs: Job[]): Promise<Job[]> {
  if (!jobs.length) return [];

  const model = getGeminiModel();
  
  // Create a simplified list of jobs for the prompt to save tokens
  const jobsList = jobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location
  }));

  const prompt = `
    You are an expert career coach and recruiter. 
    I will provide you with a resume and a list of job postings.
    Your task is to score each job based on how well it matches the resume's skills, experience, and role.
    
    RESUME:
    ${resumeContent.substring(0, 15000)} // Truncate to avoid token limits if super long

    JOBS:
    ${JSON.stringify(jobsList)}

    For each job, provide:
    1. A "score" from 0 to 100 representing the match percentage.
    2. A "matchReason" (max 15 words) explaining why it matches or doesn't.

    Return the result as a JSON object where the keys are the job IDs and the values are objects containing "score" and "matchReason".
    Example:
    {
      "job_id_1": { "score": 85, "matchReason": "Strong match for React and Node.js skills." },
      "job_id_2": { "score": 40, "matchReason": "Requires Python experience not found in resume." }
    }
    
    Return ONLY the JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let scores: Record<string, { score: number; matchReason: string }> = {};
    try {
      scores = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return jobs; // Return original jobs if parsing fails
    }

    // Merge scores back into jobs
    return jobs.map(job => {
      const scoreData = scores[job.id];
      if (scoreData) {
        return {
          ...job,
          score: scoreData.score,
          matchReason: scoreData.matchReason
        };
      }
      return job;
    });

  } catch (error) {
    console.error("Error scoring jobs with Gemini:", error);
    // Return original jobs if scoring fails
    return jobs;
  }
}
