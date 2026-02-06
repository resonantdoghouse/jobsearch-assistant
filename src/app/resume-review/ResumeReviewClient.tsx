"use client";

import { useState } from "react";
import { Toast, ToastType } from "@/components/Toast";
import { ResumeUploader } from "@/components/ResumeUploader";
import { ReviewResult } from "@/components/ReviewResult";
import { Loading } from "@/components/ui/Loading";
import {
  ResumePreview,
  ResumeData,
  ResumeFormat,
} from "@/components/ResumePreview";
import { ResumeDiffViewer } from "@/components/ResumeDiffViewer";

export function ResumeReviewClient() {
  const [analysis, setAnalysis] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [rewrittenResume, setRewrittenResume] = useState<ResumeData | null>(
    null,
  );
  const [currentResumeJson, setCurrentResumeJson] = useState<ResumeData | null>(
    null,
  );
  const [selectedFormat, setSelectedFormat] =
    useState<ResumeFormat>("standard");
  const [isRewriting, setIsRewriting] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  // New state for Q&A flow
  const [missingInfoQuestions, setMissingInfoQuestions] = useState<
    string[] | null
  >(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const [refinementInstruction, setRefinementInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const handleAnalysisComplete = (
    analysis: string,
    text: string,
    structuredResume?: ResumeData,
  ) => {
    setAnalysis(analysis);
    setExtractedText(text);
    if (structuredResume) {
      setCurrentResumeJson(structuredResume);
    }
    setRewrittenResume(null); // Reset rewrite on new upload
    setShowDiff(false);
    setRefinementInstruction("");
    setMissingInfoQuestions(null);
    setUserAnswers({});
  };

  const handleApplyFeedback = async () => {
    if (!extractedText) return;
    setIsRewriting(true);
    setMissingInfoQuestions(null); // Clear previous questions if any

    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: extractedText,
          analysis,
          format: selectedFormat,
        }),
      });
      const data = await res.json();

      if (data.rewrittenContent) {
        // Only if we got content back directly (no missing info)
        if (data.rewrittenContent.questions) {
          // Handle edge case where model put questions inside rewrittenContent for some reason,
          // or if we decide to change the API structure later.
          // For now assuming API returns { rewrittenContent: ... } OR { rewrittenContent: { questions: ... } } ??
          // Actually API returns plain JSON. If schema 1, it has "questions".
          if (data.rewrittenContent.questions) {
            setMissingInfoQuestions(data.rewrittenContent.questions);
            setToast({ message: "More information needed", type: "info" });
          } else {
            setRewrittenResume(data.rewrittenContent);
            setRefinementInstruction("");
            setToast({
              message: "Resume generated successfully!",
              type: "success",
            });
          }
        } else {
          setRewrittenResume(data.rewrittenContent);
          setRefinementInstruction("");
          setToast({
            message: "Resume generated successfully!",
            type: "success",
          });
        }
      } else if (data.error) {
        setToast({ message: data.error, type: "error" });
      }
    } catch (error) {
      console.error("Rewrite failed", error);
      setToast({ message: "Failed to generate resume", type: "error" });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleSubmitAnswers = async () => {
    if (!extractedText || !missingInfoQuestions) return;
    setIsRewriting(true);

    // Format answers for the AI
    const formattedAnswers = Object.entries(userAnswers).map(([q, a]) => ({
      question: q,
      answer: a,
    }));

    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: extractedText,
          analysis,
          format: selectedFormat,
          answers: formattedAnswers,
        }),
      });
      const data = await res.json();

      if (data.rewrittenContent) {
        if (data.rewrittenContent.questions) {
          // Even more questions?
          setMissingInfoQuestions(data.rewrittenContent.questions);
          setToast({ message: "Still need a bit more info...", type: "info" });
          // Keep answers? Or clear? Let's keep them so they can edit if needed, or maybe clear.
        } else {
          setRewrittenResume(data.rewrittenContent);
          setMissingInfoQuestions(null);
          setRefinementInstruction("");
          setToast({ message: "Resume complete!", type: "success" });
        }
      }
    } catch (error) {
      console.error("Answer submission failed", error);
      setToast({ message: "Failed to process answers", type: "error" });
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
        setToast({ message: "Resume updated successfully!", type: "success" });
      } else {
        setToast({
          message: "Failed to update resume. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Refinement failed", error);
      setToast({ message: "Failed to update resume", type: "error" });
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Review</h1>
        <p className="text-gray-600">
          Upload your resume (PDF, DOCX) to get instant AI-powered feedback on
          how to improve it for developer roles.
        </p>
      </div>

      <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />

      {analysis && !missingInfoQuestions && !rewrittenResume && (
        <div className="space-y-6">
          <ReviewResult analysis={analysis} />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label
                htmlFor="format-select"
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                Resume Style:
              </label>
              <select
                id="format-select"
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as ResumeFormat)
                }
                className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="standard">Standard</option>
                <option value="ats_optimized">
                  ATS Optimized (Recommended)
                </option>
                <option value="professional">Professional (Classic)</option>
                <option value="modern">Modern (Clean)</option>
              </select>
            </div>

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
          {isRewriting && (
            <Loading
              variant="scan"
              text="Rewriting Resume with Professional Standards..."
              className="mt-4"
            />
          )}
        </div>
      )}

      {missingInfoQuestions && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-orange-200">
          <h3 className="text-lg font-bold text-orange-800 mb-2">
            We need a bit more info
          </h3>
          <p className="text-gray-600 mb-6">
            To build the best possible developer resume, we specifically need
            details on the following:
          </p>

          <div className="space-y-6">
            {missingInfoQuestions.map((question, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {idx + 1}. {question}
                </label>
                <textarea
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                  placeholder="Type your answer here..."
                  value={userAnswers[question] || ""}
                  onChange={(e) =>
                    setUserAnswers((prev) => ({
                      ...prev,
                      [question]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmitAnswers}
              disabled={isRewriting}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              {isRewriting
                ? "Generating..."
                : "Submit Answers & Generate Resume"}
            </button>
          </div>
          {isRewriting && (
            <Loading
              variant="scan"
              text="Processing Answers & Generating Resume..."
              className="mt-4"
            />
          )}
        </div>
      )}

      {rewrittenResume && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {showDiff ? "Resume Changes" : "Improved Resume"}
            </h2>

            {currentResumeJson && (
              <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button
                  onClick={() => setShowDiff(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    !showDiff
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setShowDiff(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    showDiff
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Compare Changes
                </button>
              </div>
            )}
          </div>

          {showDiff && currentResumeJson ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <ResumeDiffViewer
                oldData={currentResumeJson}
                newData={rewrittenResume}
              />
            </div>
          ) : (
            <ResumePreview
              content={rewrittenResume}
              analysis={analysis}
              isEditable={true}
              format={selectedFormat}
            />
          )}

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
            <div className="flex flex-col gap-4">
              <textarea
                value={refinementInstruction}
                onChange={(e) => setRefinementInstruction(e.target.value)}
                placeholder="E.g., Change my email to alex@example.com"
                className="w-full border-gray-300 rounded-lg shadow-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 min-h-[100px] resize-y"
                disabled={isRefining}
              />
              <div className="flex justify-end">
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
              {isRefining && (
                <Loading
                  variant="scan"
                  text="Refining Resume..."
                  className="mt-4"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
