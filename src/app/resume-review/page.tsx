"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ReviewResult } from "@/components/ReviewResult";
import { ResumePreview } from "@/components/ResumePreview";

export default function ResumeReviewPage() {
  const [analysis, setAnalysis] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [rewrittenResume, setRewrittenResume] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAnalysisComplete = (analysis: string, text: string) => {
    setAnalysis(analysis);
    setExtractedText(text);
    setRewrittenResume(null); // Reset rewrite on new upload
  };

  const handleApplyFeedback = async () => {
    if (!extractedText) return;
    setIsRewriting(true);
    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText: extractedText, analysis }),
      });
      const data = await res.json();
      setRewrittenResume(data.rewrittenContent);
    } catch (error) {
      console.error("Rewrite failed", error);
      alert("Failed to rewrite resume");
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Review</h1>
        <p className="text-gray-600">
          Upload your resume (PDF, DOCX) to get instant AI-powered feedback on how to improve it for developer roles.
        </p>
      </div>

      <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
      
      {analysis && (
        <div className="space-y-6">
          <ReviewResult analysis={analysis} />
          
          <div className="flex justify-end bg-gray-50 p-4 rounded-lg border border-gray-200">
             <button
                onClick={handleApplyFeedback}
                disabled={isRewriting}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors ${
                  isRewriting ? "opacity-50 cursor-not-allowed" : ""
                }`}
             >
                {isRewriting ? "Applying Improvements..." : "Apply Feedback & Rewrite Resume"}
             </button>
          </div>
        </div>
      )}

      {rewrittenResume && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <ResumePreview content={rewrittenResume} analysis={analysis} />
        </div>
      )}
    </div>
  );
}
