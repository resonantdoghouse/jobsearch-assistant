"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ToastContext";

interface Problem {
  _id: string;
  title: string;
  description: string;
  starterCode: Record<string, string>;
  testCases: { input: string; output: string }[];
  hints: string[];
  resources: { title: string; url: string; type?: string }[];
  solution?: {
    title: string;
    explanation: string;
    code: Record<string, string>;
  };
}

interface ProblemClientProps {
  slug: string;
  userId: string;
}

export default function ProblemClient({ slug, userId }: ProblemClientProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "Idle" | "Running" | "Success" | "Failed"
  >("Idle");
  const { success, error } = useToast();

  useEffect(() => {
    async function fetchProblemAndSubmission() {
      if (!slug) return;
      try {
        // 1. Fetch Problem
        const res = await fetch(`/api/problems/${slug}`);
        const data = await res.json();

        if (data.success) {
          const fetchedProblem = data.problem;
          setProblem(fetchedProblem);

          // 2. Fetch Previous Submission
          try {
            const subRes = await fetch(
              `/api/problems/${slug}/submission?userId=${userId}`,
            );
            const subData = await subRes.json();
            if (subData.success && subData.submission) {
              setCode(subData.submission.code);
              console.log("Loaded previous submission");
            } else {
              // Default to starter code
              setCode(
                fetchedProblem.starterCode?.javascript ||
                  "// Write your solution here",
              );
            }
          } catch (subErr) {
            console.warn(
              "Failed to fetch submission, using starter code",
              subErr,
            );
            setCode(
              fetchedProblem.starterCode?.javascript ||
                "// Write your solution here",
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch problem", error);
      }
    }
    fetchProblemAndSubmission();
  }, [slug, userId]);

  const runCode = () => {
    if (!problem) return;
    setStatus("Running");
    setOutput([]);

    try {
      const logs: string[] = [];
      let allPassed = true;

      problem.testCases.forEach((tc, index) => {
        // Find function name heuristic
        const match = code.match(
          /(?:var|const|let)\s+(\w+)\s*=|function\s+(\w+)\s*\(/,
        );
        const funcName = match ? match[1] || match[2] : null;

        if (!funcName) {
          logs.push("Could not find function name in code.");
          allPassed = false;
          return;
        }

        const runScript = `
                ${code}
                return ${funcName}(${tc.input});
            `;

        try {
          const userFunc = new Function(runScript);
          const result = userFunc();
          const expected = JSON.parse(tc.output);
          const resultJson = JSON.stringify(result);
          const expectedJson = JSON.stringify(expected);

          if (resultJson === expectedJson) {
            logs.push(`Test Case ${index + 1}: Passed`);
          } else {
            logs.push(
              `Test Case ${
                index + 1
              }: Failed. Expected ${expectedJson}, got ${resultJson}`,
            );
            allPassed = false;
          }
        } catch (e: unknown) {
          logs.push(`Test Case ${index + 1}: Error - ${(e as Error).message}`);
          allPassed = false;
        }
      });

      setOutput(logs);
      setStatus(allPassed ? "Success" : "Failed");
    } catch (e: unknown) {
      setOutput([`Runtime Error: ${(e as Error).message}`]);
      setStatus("Failed");
    }
  };

  const submitSolution = async () => {
    if (!problem || status !== "Success") return;

    try {
      // Calculate basic score
      const calculatedScore = 100; // Placeholder for more complex scoring

      const res = await fetch("/api/problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem._id,
          userId,
          code,
          language: "javascript",
          status: "Accepted",
          executionTime: 0, // Placeholder
          score: calculatedScore,
          timeComplexity: "O(n)", // Placeholder/User input?
          spaceComplexity: "O(n)",
        }),
      });

      const data = await res.json();
      if (data.success) {
        success(`Solution submitted! Score: ${calculatedScore}`);
      } else {
        error(data.error || "Failed to submit solution");
      }
    } catch (err) {
      console.error("Submission error", err);
      error("An error occurred during submission");
    }
  };

  if (!problem) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: Problem Description */}
      <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r bg-gray-50 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        <div className="prose prose-sm max-w-none mb-8">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>

        {/* Hints Section */}
        {problem.hints && problem.hints.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Hints</h3>
            <div className="space-y-2">
              {problem.hints.map((hint, i) => (
                <details
                  key={i}
                  className="bg-white border rounded px-4 py-2 cursor-pointer shadow-sm"
                >
                  <summary className="text-sm font-medium text-gray-700 select-none">
                    Hint {i + 1}
                  </summary>
                  <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-indigo-200">
                    {hint}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* Resources Section */}
        {problem.resources && problem.resources.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Related Resources</h3>
            <ul className="space-y-2 bg-white rounded border p-4 shadow-sm">
              {problem.resources.map((resource, i) => (
                <li key={i} className="flex items-start">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium flex items-center"
                  >
                    {resource.title}
                    {resource.type && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {resource.type}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solution Section */}
        {problem.solution && (
          <div className="mb-6">
            <details className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 font-semibold text-green-900 cursor-pointer flex justify-between items-center bg-green-100 hover:bg-green-200 transition">
                <span>Show Solution</span>
                <span className="text-xs font-normal text-green-700 bg-white/50 px-2 py-1 rounded">
                  Click to reveal
                </span>
              </summary>
              <div className="p-4 bg-white">
                <h4 className="font-bold text-gray-900 mb-2">
                  {problem.solution.title}
                </h4>
                <div className="prose prose-sm max-w-none text-gray-700 mb-4 bg-gray-50 p-3 rounded">
                  <ReactMarkdown>{problem.solution.explanation}</ReactMarkdown>
                </div>
                <div className="relative">
                  <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border">
                    Javascript
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm font-mono leading-relaxed">
                    {problem.solution.code["javascript"]}
                  </pre>
                  <button
                    onClick={() =>
                      setCode(problem.solution!.code["javascript"])
                    }
                    className="mt-2 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded border border-indigo-200 hover:bg-indigo-100 transition"
                  >
                    Copy to Editor
                  </button>
                </div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Right: Editor */}
      <div className="w-full md:w-2/3 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        {/* Output & Controls */}
        <div className="h-[30vh] bg-gray-900 text-white p-4 overflow-y-auto border-t border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-400">Console</h3>
            <div className="space-x-2">
              <button
                onClick={runCode}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium text-sm transition"
              >
                Run Code
              </button>
              <button
                onClick={submitSolution}
                className={`px-4 py-2 rounded text-white font-medium text-sm transition ${status === "Success" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed"}`}
                disabled={status !== "Success"}
              >
                Submit
              </button>
            </div>
          </div>
          <div className="font-mono text-sm space-y-1">
            {output.length === 0 && (
              <span className="text-gray-500">Run code to see output...</span>
            )}
            {output.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("Failed") || line.includes("Error")
                    ? "text-red-400"
                    : "text-green-400"
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
