"use client";

import { useState, useEffect } from "react";

interface Resume {
  _id: string;
  title: string;
  latestContent: string;
  updatedAt: string;
}

export default function CoverLetterPage() {
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

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          setSavedResumes(data.resumes || []);
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
              ", "
            )} ${parsed.skills?.frameworks?.join(", ")}`,
            `Experience:`,
            parsed.experience
              ?.map(
                (exp: any) =>
                  `- ${exp.role} at ${exp.company} (${
                    exp.duration
                  }): ${exp.description?.join(" ")}`
              )
              .join("\n"),
            `Education:`,
            parsed.education
              ?.map((edu: any) => `- ${edu.degree} at ${edu.school}`)
              .join("\n"),
          ].join("\n\n");
        }
      } catch (e) {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cover Letter Generator
        </h1>
        <p className="text-gray-600">
          Provide the job details and your resume text to generate a tailored
          cover letter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              name="jobTitle"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.resumeText}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>
        </form>

        {/* Output Area */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Generated Letter</h2>
            {generatedLetter && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save to Dashboard"}
              </button>
            )}
          </div>
          {generatedLetter ? (
            <div className="whitespace-pre-wrap text-sm text-gray-800 font-serif leading-relaxed">
              {generatedLetter}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">
              Your cover letter will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
