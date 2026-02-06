"use client";

import {
  ResumePreview,
  ResumeData,
  ResumeFormat,
} from "@/components/ResumePreview";
import { useToast } from "@/components/ToastContext";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ResumeEditor({ resume }: { resume: any }) {
  let content;
  try {
    content = JSON.parse(resume.latestContent);
  } catch {
    content = resume.latestContent;
  }

  const latestVersion =
    resume.versions && resume.versions.length > 0
      ? resume.versions[resume.versions.length - 1]
      : null;
  const analysis = latestVersion?.feedback;
  const { success, error } = useToast();

  const [isAiEditing, setIsAiEditing] = useState(false);
  const [userInstructions, setUserInstructions] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Need to make `content` a state here to trigger re-renders
  const [displayContent, setDisplayContent] = useState(content);
  // Also need a key to force ResumePreview to re-initialize
  const [contentKey, setContentKey] = useState(0);

  const [selectedFormat, setSelectedFormat] = useState<ResumeFormat>(
    resume.format || "standard",
  );

  const performAiEdit = async () => {
    if (!userInstructions.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/resumes/${resume._id}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: displayContent,
          userInstructions,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setDisplayContent(data.content);
      setContentKey((prev) => prev + 1); // Force re-render of Preview
      setIsAiEditing(false);
      setUserInstructions("");
    } catch (e) {
      error("AI Error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (updatedContent: ResumeData) => {
    try {
      const res = await fetch(`/api/resumes/${resume._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: updatedContent,
          format: selectedFormat,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      setDisplayContent(updatedContent);
      setContentKey((prev) => prev + 1);
      success("Resume updated successfully!");
    } catch {
      error("Failed to save changes.");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Template:</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as ResumeFormat)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
          >
            <option value="standard">Standard</option>
            <option value="ats_optimized">ATS Optimized (Recommended)</option>
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="minimalist">Minimalist Dev</option>
            <option value="tech_impact">Tech Impact</option>
          </select>
        </div>

        <button
          onClick={() => setIsAiEditing(!isAiEditing)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.234-1.253.487-1.926.83C2.863 15.96 1.8 16 1.8 16a.17.17 0 0 1-.168-.216c.153-.578.337-1.121.57-1.637A8.995 8.995 0 0 1 0 8c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          Edit with Gemini
        </button>
      </div>

      {isAiEditing && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
          <label className="block text-sm font-medium text-purple-900 mb-2">
            How should Gemini improve your resume?
          </label>
          <div className="flex flex-col gap-3">
            <textarea
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              placeholder="e.g. 'Change all C++ references to React' or 'Make the summary more professional'"
              className="w-full border-purple-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 min-h-[100px] p-3"
            />
            <div className="flex justify-end">
              <button
                onClick={performAiEdit}
                disabled={isProcessing || !userInstructions.trim()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "Processing..." : "Generate"}
              </button>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            * AI will attempt to modify your resume based on your instructions.
            Please review changes before saving.
          </p>
        </div>
      )}

      <ResumePreview
        key={contentKey}
        content={displayContent}
        analysis={analysis}
        isEditable={true}
        format={selectedFormat}
        onSave={handleSave}
      />
    </div>
  );
}
