"use client";

import { useState } from "react";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ReviewResult } from "@/components/ReviewResult";
import { ResumePreview } from "@/components/ResumePreview";

export function ResumeReviewClient() {
  const [analysis, setAnalysis] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [rewrittenResume, setRewrittenResume] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);

  const [refinementInstruction, setRefinementInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleAnalysisComplete = (analysis: string, text: string) => {
    setAnalysis(analysis);
    setExtractedText(text);
    setRewrittenResume(null); // Reset rewrite on new upload
    setRefinementInstruction("");
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
      setRefinementInstruction("");
    } catch (error) {
      console.error("Rewrite failed", error);
      alert("Failed to rewrite resume");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleRefinement = async () => {
    if (!rewrittenResume || !refinementInstruction.trim()) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentResumeJson: rewrittenResume,
          analysis: refinementInstruction, // Reuse the analysis field for instruction
        }),
      });
      const data = await res.json();
      if (data.rewrittenContent) {
        setRewrittenResume(data.rewrittenContent);
        setRefinementInstruction("");
      } else {
        alert("Failed to update resume. Please try again.");
      }
    } catch (error) {
      console.error("Refinement failed", error);
      alert("Failed to update resume");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Review</h1>
        <p className="text-gray-600">
          Upload your resume (PDF, DOCX) to get instant AI-powered feedback on
          how to improve it for developer roles.
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
              {isRewriting
                ? "Applying Improvements..."
                : "Apply Feedback & Rewrite Resume"}
            </button>
          </div>
        </div>
      )}

      {rewrittenResume && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ResumePreview content={rewrittenResume} analysis={analysis} />

          {/* Refinement Section */}
          <div className="mt-8 bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">
              Want to make adjustments?
            </h3>
            <p className="text-indigo-700 text-sm mb-4">
              Review the generated resume above. If you'd like to change
              something (e.g., "Add React Native to skills", "Fix the date on my
              last job"), describe it below and we'll update it for you.
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                value={refinementInstruction}
                onChange={(e) => setRefinementInstruction(e.target.value)}
                placeholder="E.g., Change my email to alex@example.com"
                className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isRefining &&
                    refinementInstruction.trim()
                  ) {
                    handleRefinement();
                  }
                }}
              />
              <button
                onClick={handleRefinement}
                disabled={isRefining || !refinementInstruction.trim()}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isRefining || !refinementInstruction.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isRefining ? "Updating..." : "Update Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
