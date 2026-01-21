"use client";

import { useState } from "react";

import { downloadPDF, downloadDOCX, downloadRTF } from "@/lib/utils/download";
import { useToast } from "@/components/ToastContext";

interface CoverLetterData {
  _id: string;
  jobDescription?: string;
  content: string;
  createdAt: string;
}

export function CoverLetterEditor({
  coverLetter,
}: {
  coverLetter: CoverLetterData;
}) {
  const [content, setContent] = useState(coverLetter.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cover-letters/${coverLetter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString());
        success("Saved successfully");
      } else {
        error("Failed to save cover letter");
      }
    } catch (err) {
      console.error("Save failed", err);
      error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (format: "pdf" | "docx" | "rtf") => {
    const filename = `Cover_Letter_${(coverLetter.jobDescription || "Saved").replace(/[^a-z0-9]/gi, "_")}`;

    if (format === "pdf") {
      downloadPDF(content, filename);
    } else if (format === "docx") {
      downloadDOCX(content, filename);
    } else if (format === "rtf") {
      downloadRTF(content, filename);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    success("Copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Cover Letter
          </h2>
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex border rounded overflow-hidden bg-white">
            <button
              onClick={() => handleDownload("pdf")}
              className="text-xs px-3 py-2 hover:bg-gray-50 border-r text-gray-700 font-medium"
              title="Download as PDF"
            >
              PDF
            </button>
            <button
              onClick={() => handleDownload("docx")}
              className="text-xs px-3 py-2 hover:bg-gray-50 border-r text-gray-700 font-medium"
              title="Download as Word DOCX"
            >
              DOCX
            </button>
            <button
              onClick={() => handleDownload("rtf")}
              className="text-xs px-3 py-2 hover:bg-gray-50 text-gray-700 font-medium"
              title="Download as RTF"
            >
              RTF
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
          >
            Copy Text
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans text-base leading-relaxed"
        placeholder="Start writing your cover letter..."
      />
    </div>
  );
}
