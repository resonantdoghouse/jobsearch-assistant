"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ReviewResult } from "@/components/ReviewResult";
// Note: I initially put react-markdown in ReviewResult but didn't install it in package.json.
// I will just use the pre-wrap version in ReviewResult for now to save a step, or I can install it.
// Let's stick to the pre-wrap implementation in ReviewResult I just wrote.

export default function ResumeReviewPage() {
  const [analysis, setAnalysis] = useState<string>("");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Review</h1>
        <p className="text-gray-600">
          Upload your resume (PDF, DOCX) to get instant AI-powered feedback on how to improve it for developer roles.
        </p>
      </div>

      <ResumeUploader onAnalysisComplete={setAnalysis} />
      
      {analysis && <ReviewResult analysis={analysis} />}
    </div>
  );
}
