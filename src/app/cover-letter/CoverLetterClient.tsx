"use client";

import { useState, useEffect } from "react";

import { downloadPDF, downloadDOCX, downloadRTF } from "@/lib/utils/download";

interface Resume {
  _id: string;
  title: string;
  latestContent: string;
  updatedAt: string;
  isStarred?: boolean;
}

export function CoverLetterClient() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    description: "",
    resumeText: "",
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);

  // New state for Application Questions
  const [activeTab, setActiveTab] = useState<"cover-letter" | "questions">(
    "cover-letter",
  );
  const [question, setQuestion] = useState("");
  const [generatedAnswer, setGeneratedAnswer] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          // Sort resumes: starred first, then by date
          const sortedResumes = (data.resumes || []).sort(
            (a: Resume, b: Resume) => {
              if (a.isStarred === b.isStarred) {
                return (
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
                );
              }
              return a.isStarred ? -1 : 1;
            },
          );
          setSavedResumes(sortedResumes);
        }
      } catch (error) {
        console.error("Failed to fetch resumes", error);
      }
    }
    fetchResumes();
  }, []);

  const handleResumeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resumeId = e.target.value;
    if (!resumeId) return;

    const resume = savedResumes.find((r) => r._id === resumeId);
    if (resume) {
      let content = resume.latestContent;
      try {
        // specific parsing logic if it is a JSON string
        const parsed = JSON.parse(content);
        if (typeof parsed === "object") {
          // Flatten the object into a readable string for the LLM
          content = [
            `Name: ${parsed.fullName}`,
            `Summary: ${parsed.summary}`,
            `Skills: ${parsed.skills?.languages?.join(
              ", ",
            )} ${parsed.skills?.frameworks?.join(", ")}`,
            `Experience:`,
            parsed.experience
              ?.map(
                (exp: {
                  role: string;
                  company: string;
                  duration: string;
                  description?: string[];
                }) =>
                  `- ${exp.role} at ${exp.company} (${
                    exp.duration
                  }): ${exp.description?.join(" ")}`,
              )
              .join("\n"),
            `Education:`,
            parsed.education
              ?.map(
                (edu: { degree: string; school: string }) =>
                  `- ${edu.degree} at ${edu.school}`,
              )
              .join("\n"),
          ].join("\n\n");
        }
      } catch {
        // if not json, use as is
      }
      setFormData((prev) => ({ ...prev, resumeText: content }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setGeneratedLetter(data.coverLetter);
    } catch (error) {
      console.error(error);
      alert("Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLetter) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedLetter,
          jobTitle: formData.jobTitle,
          company: formData.company,
          jobDescription: formData.description,
        }),
      });
      if (res.ok) {
        alert("Cover letter saved to dashboard!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save cover letter");
      }
    } catch (error) {
      console.error("Failed to save", error);
      alert("Failed to save cover letter");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (format: "pdf" | "docx" | "rtf") => {
    if (!generatedLetter) return;
    const filename = `Cover_Letter_${formData.company.replace(/[^a-z0-9]/gi, "_") || "Generated"}`;

    if (format === "pdf") {
      downloadPDF(generatedLetter, filename);
    } else if (format === "docx") {
      downloadDOCX(generatedLetter, filename);
    } else if (format === "rtf") {
      downloadRTF(generatedLetter, filename);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAnswer = async () => {
    if (!question) return;
    setAnswerLoading(true);
    try {
      const res = await fetch("/api/generate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, question }),
      });
      const data = await res.json();
      setGeneratedAnswer(data.answer);
    } catch (error) {
      console.error(error);
      alert("Failed to generate answer");
    } finally {
      setAnswerLoading(false);
    }
  };

  const copyAnswer = async () => {
    await navigator.clipboard.writeText(generatedAnswer);
    alert("Answer copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Job Application Assistant
        </h1>
        <p className="text-gray-600">
          Generate tailored cover letters and specific answers for job
          application questions.
        </p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("cover-letter")}
          className={`pb-2 px-1 font-medium text-sm transition-colors ${
            activeTab === "cover-letter"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Cover Letter Generator
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-2 px-1 font-medium text-sm transition-colors ${
            activeTab === "questions"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Application Questions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Shared Input Form */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Job Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              name="jobTitle"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.jobTitle}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              name="company"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.company}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Your Resume Content (Text)
              </label>
              {savedResumes.length > 0 && (
                <select
                  className="text-sm border-gray-300 text-gray-600 border rounded p-1"
                  onChange={handleResumeSelect}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Load Saved Resume...
                  </option>
                  {savedResumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.isStarred ? "★ " : ""}
                      {r.title} ({new Date(r.updatedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              name="resumeText"
              required
              rows={6}
              placeholder="Paste your resume text here..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.resumeText}
              onChange={handleChange}
            />
          </div>

          {activeTab === "cover-letter" && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Generate Cover Letter"}
            </button>
          )}
        </div>

        {/* Output Area */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          {activeTab === "cover-letter" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Generated Letter</h2>
                {generatedLetter && (
                  <div className="flex gap-2 items-center">
                    <div className="flex border rounded overflow-hidden">
                      <button
                        onClick={() => handleDownload("pdf")}
                        className="text-xs bg-gray-100 px-2 py-1 hover:bg-gray-200 border-r"
                        title="Download as PDF"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleDownload("docx")}
                        className="text-xs bg-gray-100 px-2 py-1 hover:bg-gray-200 border-r"
                        title="Download as Word DOCX"
                      >
                        DOCX
                      </button>
                      <button
                        onClick={() => handleDownload("rtf")}
                        className="text-xs bg-gray-100 px-2 py-1 hover:bg-gray-200"
                        title="Download as RTF"
                      >
                        RTF
                      </button>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save to Dashboard"}
                    </button>
                  </div>
                )}
              </div>
              {generatedLetter ? (
                <div className="whitespace-pre-wrap text-sm text-gray-800 font-serif leading-relaxed">
                  {generatedLetter}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">
                  Your cover letter will appear here...
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Question
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. What excites you most about this role?"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button
                    onClick={handleGenerateAnswer}
                    disabled={answerLoading || !question}
                    className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    {answerLoading ? "Generating Answer..." : "Generate Answer"}
                  </button>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Generated Answer</h2>
                  {generatedAnswer && (
                    <button
                      onClick={copyAnswer}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Copy Text
                    </button>
                  )}
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-md p-4 overflow-y-auto">
                  {generatedAnswer ? (
                    <div className="whitespace-pre-wrap text-sm text-gray-800 font-serif leading-relaxed">
                      {generatedAnswer}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">
                      Enter a question and click generate to see the answer...
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
