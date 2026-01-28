"use client";

import { useState } from "react";
import { Loading } from "@/components/ui/Loading";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  date: string;
  source: "linkedin" | "indeed";
}

export default function JobSearchPage() {
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("Remote");
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "linkedin",
    "indeed",
  ]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSourceChange = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setJobs([]);
    setHasSearched(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords,
          location,
          sources: selectedSources,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setJobs(data.jobs || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
          Find Your Next Role
        </h1>
        <p className="text-lg text-gray-600">
          Search across LinkedIn and Indeed instantly.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 transition-all hover:shadow-md">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Frontend Developer, React"
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Toronto ON"
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-700">Sources:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSources.includes("linkedin")}
                onChange={() => handleSourceChange("linkedin")}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">LinkedIn</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSources.includes("indeed")}
                onChange={() => handleSourceChange("indeed")}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Indeed</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-all shadow-md hover:shadow-lg ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <Loading variant="spinner" text="Searching..." />
              ) : (
                "Search Jobs"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading && !jobs.length && (
          <div className="py-12">
            <Loading variant="skeleton" />
            <p className="mt-4 text-center text-gray-500">
              Scouring the web for opportunities...
            </p>
          </div>
        )}

        {!loading && hasSearched && jobs.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500 text-lg">
              No jobs found. Try different keywords or location.
            </p>
            {selectedSources.includes("indeed") && (
              <p className="mt-2 text-sm text-gray-400">
                Note: Indeed has strict anti-scraping.{" "}
                <a
                  href={`https://ca.indeed.com/jobs?q=${keywords}&l=${location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Click here to search Indeed directly.
                </a>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full"
            >
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.source === "linkedin"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {job.source === "linkedin" ? "LinkedIn" : "Indeed"}
                  </span>
                  <span className="text-xs text-gray-500">{job.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {job.company}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {job.location}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  View Job
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
