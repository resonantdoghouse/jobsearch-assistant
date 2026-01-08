"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardItem {
  _id: string;
  title?: string; // For resumes
  fileName?: string; // For analyses
  jobDescription?: string; // For cover letters
  content?: string; // For cover letters
  createdAt: string;
}

interface DashboardProps {
  user: any;
  resumes: DashboardItem[];
  analyses: DashboardItem[];
  coverLetters: DashboardItem[];
}

export function DashboardClient({
  user,
  resumes: initialResumes,
  analyses: initialAnalyses,
  coverLetters: initialCoverLetters,
}: DashboardProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [coverLetters, setCoverLetters] = useState(initialCoverLetters);

  const handleDelete = async (
    type: "resume" | "analysis" | "cover-letter",
    id: string
  ) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch("/api/delete-item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });

      if (res.ok) {
        if (type === "resume") {
          setResumes((prev) => prev.filter((item) => item._id !== id));
        } else if (type === "analysis") {
          setAnalyses((prev) => prev.filter((item) => item._id !== id));
        } else if (type === "cover-letter") {
          setCoverLetters((prev) => prev.filter((item) => item._id !== id));
        }
        router.refresh();
      } else {
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("An error occurred");
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[300px] mb-8">
        <div className="flex items-center gap-4 mb-6">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📄</span> Saved Resumes
          </h3>
          {resumes.length === 0 ? (
            <p className="text-gray-500 italic">No saved resumes found.</p>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-blue-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {resume.title || "Untitled Resume"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/resumes/${resume._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete("resume", resume._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analysis Sessions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span> Analysis Sessions
          </h3>
          {analyses.length === 0 ? (
            <p className="text-gray-500 italic">No analysis sessions found.</p>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-purple-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {analysis.fileName || "Unknown File"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/analyses/${analysis._id}`}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium px-2 py-1"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete("analysis", analysis._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cover Letters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">✉️</span> Saved Cover Letters
          </h3>
          {coverLetters.length === 0 ? (
            <p className="text-gray-500 italic">
              No saved cover letters found.
            </p>
          ) : (
            <div className="space-y-3">
              {coverLetters.map((cl) => (
                <div
                  key={cl._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-green-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900 truncate max-w-md">
                      {cl.jobDescription?.substring(0, 50) || "Cover Letter"}...
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(cl.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (cl.content) {
                          await navigator.clipboard.writeText(cl.content);
                          alert("Cover letter copied to clipboard!");
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete("cover-letter", cl._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
