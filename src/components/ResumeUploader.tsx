"use client";

import { useState } from "react";

export function ResumeUploader({ onAnalysisComplete }: { onAnalysisComplete: (analysis: string, extractedText: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await res.json();
      onAnalysisComplete(data.analysis, data.extractedText);
    } catch (err) {
      setError("An error occurred during analysis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold mb-4">Upload Your Resume</h3>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${
            !file || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
