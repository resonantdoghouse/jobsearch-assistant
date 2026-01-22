"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";
import { ConfirmationModal } from "@/components/ConfirmationModal";

import Image from "next/image";

interface DashboardItem {
  _id: string;
  title?: string; // For resumes
  fileName?: string; // For analyses
  jobDescription?: string; // For cover letters
  content?: string; // For cover letters
  isStarred?: boolean;
  createdAt: string;
}

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface DashboardProps {
  user: User;
  resumes: DashboardItem[];
  analyses: DashboardItem[];
  coverLetters: DashboardItem[];
  submissions: any[]; // Using any for now to avoid strict typing on populate, ideally create interface
}

export function DashboardClient({
  user,
  resumes: initialResumes,
  analyses: initialAnalyses,
  coverLetters: initialCoverLetters,
  submissions,
}: DashboardProps) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [coverLetters, setCoverLetters] = useState(initialCoverLetters);
  const { success, error } = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "resume" | "analysis" | "cover-letter";
    id: string;
  } | null>(null);

  const [resumeSort, setResumeSort] = useState<"newest" | "oldest">("newest");
  const [analysisSort, setAnalysisSort] = useState<"newest" | "oldest">(
    "newest",
  );
  const [coverLetterSort, setCoverLetterSort] = useState<"newest" | "oldest">(
    "newest",
  );

  const handleDeleteClick = (
    type: "resume" | "analysis" | "cover-letter",
    id: string,
  ) => {
    setItemToDelete({ type, id });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;

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
        success("Item deleted successfully");
      } else {
        error("Failed to delete item");
      }
    } catch (err) {
      console.error("Delete failed", err);
      error("An error occurred");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleToggleStar = async (
    type: "resume" | "analysis" | "cover-letter",
    id: string,
    currentStarred: boolean,
  ) => {
    try {
      const newStarredStatus = !currentStarred;

      // Optimistic update
      if (type === "resume") {
        setResumes((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isStarred: newStarredStatus } : item,
          ),
        );
      } else if (type === "analysis") {
        setAnalyses((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isStarred: newStarredStatus } : item,
          ),
        );
      } else if (type === "cover-letter") {
        setCoverLetters((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isStarred: newStarredStatus } : item,
          ),
        );
      }

      const res = await fetch("/api/toggle-star", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, isStarred: newStarredStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle star");
      }
      router.refresh();
    } catch (err) {
      console.error("Toggle star failed", err);
      error("Failed to update favorite status");
      // Revert optimistic update ideally, but simple alert for now
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortItems = <T extends DashboardItem>(
    items: T[],
    sortOrder: "newest" | "oldest",
  ) => {
    return [...items].sort((a, b) => {
      // Prioritize starred items
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const sortedResumes = sortItems(resumes, resumeSort);
  const sortedAnalyses = sortItems(analyses, analysisSort);
  const sortedCoverLetters = sortItems(coverLetters, coverLetterSort);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={64}
                height={64}
                className="rounded-full border-2 border-indigo-100"
                unoptimized
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            <div className="bg-indigo-50 px-4 py-3 rounded-lg min-w-[120px] text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {resumes.length}
              </div>
              <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                Resumes
              </div>
            </div>
            <div className="bg-purple-50 px-4 py-3 rounded-lg min-w-[120px] text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyses.length}
              </div>
              <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                Analyses
              </div>
            </div>
            <div className="bg-green-50 px-4 py-3 rounded-lg min-w-[120px] text-center">
              <div className="text-2xl font-bold text-green-600">
                {coverLetters.length}
              </div>
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider">
                Cover Letters
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interview Prep Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Interview Prep
            </h3>

            {submissions && submissions.length > 0 ? (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  You have solved <strong>{submissions.length}</strong>{" "}
                  challenge{submissions.length !== 1 && "s"}. Keep it up!
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {submissions.map((sub: any) => (
                    <div
                      key={sub._id}
                      className="flex justify-between items-center text-sm bg-green-50 p-2 rounded border border-green-100"
                    >
                      <span className="font-medium text-gray-800">
                        {sub.problemId?.title || "Unknown Problem"}
                      </span>
                      <Link
                        href={`/dashboard/interview-prep/${sub.problemId?.slug}`}
                        className="text-indigo-600 hover:underline text-xs"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Practice coding problems with our new LeetCode-style assistant.
                Improve your algorithm skills before your next interview.
              </p>
            )}
          </div>
          <Link
            href="/dashboard/interview-prep"
            className="block w-full text-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {submissions && submissions.length > 0
              ? "Practice More"
              : "Start Practicing"}
          </Link>
        </div>

        {/* Resumes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">📄</span> Saved Resumes
            </h3>
            <button
              onClick={() =>
                setResumeSort(resumeSort === "newest" ? "oldest" : "newest")
              }
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title={resumeSort === "newest" ? "Newest First" : "Oldest First"}
            >
              {resumeSort === "newest" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          {resumes.length === 0 ? (
            <p className="text-gray-500 italic">No saved resumes found.</p>
          ) : (
            <div className="space-y-3">
              {sortedResumes.map((resume) => (
                <div
                  key={resume._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() =>
                        handleToggleStar(
                          "resume",
                          resume._id,
                          !!resume.isStarred,
                        )
                      }
                      className={`focus:outline-none transition-colors ${
                        resume.isStarred
                          ? "text-yellow-400 hover:text-yellow-500"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                      title={
                        resume.isStarred
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={resume.isStarred ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-semibold text-gray-900 truncate"
                        title={resume.title}
                      >
                        {resume.title || "Untitled Resume"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(resume.createdAt)}
                      </div>
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
                      onClick={() => handleDeleteClick("resume", resume._id)}
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">🔍</span> Analysis Sessions
            </h3>
            <button
              onClick={() =>
                setAnalysisSort(analysisSort === "newest" ? "oldest" : "newest")
              }
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
              title={
                analysisSort === "newest" ? "Newest First" : "Oldest First"
              }
            >
              {analysisSort === "newest" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          {analyses.length === 0 ? (
            <p className="text-gray-500 italic">No analysis sessions found.</p>
          ) : (
            <div className="space-y-3">
              {sortedAnalyses.map((analysis) => (
                <div
                  key={analysis._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-purple-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() =>
                        handleToggleStar(
                          "analysis",
                          analysis._id,
                          !!analysis.isStarred,
                        )
                      }
                      className={`focus:outline-none transition-colors ${
                        analysis.isStarred
                          ? "text-yellow-400 hover:text-yellow-500"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                      title={
                        analysis.isStarred
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={analysis.isStarred ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-semibold text-gray-900 truncate"
                        title={analysis.fileName}
                      >
                        {analysis.fileName || "Unknown File"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(analysis.createdAt)}
                      </div>
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
                      onClick={() =>
                        handleDeleteClick("analysis", analysis._id)
                      }
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">✉️</span> Saved Cover Letters
            </h3>
            <button
              onClick={() =>
                setCoverLetterSort(
                  coverLetterSort === "newest" ? "oldest" : "newest",
                )
              }
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title={
                coverLetterSort === "newest" ? "Newest First" : "Oldest First"
              }
            >
              {coverLetterSort === "newest" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          {coverLetters.length === 0 ? (
            <p className="text-gray-500 italic">
              No saved cover letters found.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedCoverLetters.map((cl) => (
                <div
                  key={cl._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() =>
                        handleToggleStar("cover-letter", cl._id, !!cl.isStarred)
                      }
                      className={`focus:outline-none transition-colors ${
                        cl.isStarred
                          ? "text-yellow-400 hover:text-yellow-500"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                      title={
                        cl.isStarred
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={cl.isStarred ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <div
                        className="font-semibold text-gray-900 truncate"
                        title={cl.jobDescription}
                      >
                        {cl.jobDescription || "Cover Letter"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(cl.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (cl.content) {
                          await navigator.clipboard.writeText(cl.content);
                          success("Cover letter copied to clipboard!");
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
                    >
                      Copy
                    </button>
                    <Link
                      href={`/cover-letters/${cl._id}`}
                      className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteClick("cover-letter", cl._id)}
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

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
