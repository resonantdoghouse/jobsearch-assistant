"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

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

export default function ProblemPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "Idle" | "Running" | "Success" | "Failed"
  >("Idle");

  useEffect(() => {
    async function fetchProblem() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/problems/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProblem(data.problem);
          // Default to JavaScript
          setCode(
            data.problem.starterCode?.javascript ||
              "// Write your solution here"
          );
        }
      } catch (error) {
        console.error("Failed to fetch problem", error);
      }
    }
    fetchProblem();
  }, [slug]);

  const runCode = () => {
    if (!problem) return;
    setStatus("Running");
    setOutput([]);

    // Very basic client-side execution using Function constructor
    // WARNING: This is unsafe in general, but used here for MVP demonstration.
    // In prod, use a sandboxed runner or Web Worker.

    try {
      const logs: string[] = [];

      // Wrap user code to return the function
      // We assume user defines a function as per starter code
      // e.g. var twoSum = function(...) { ... }

      // We need to extract the function name or expect a specific return
      // For simplicity, we'll append "return [FunctionName];" if we knew the name,
      // or just rely on the last statement.

      // Better approach for MVP:
      // We'll append a test runner script to the user's code.

      // Let's assume the starter code defines a variable.
      // We will try to execute it against test cases.

      let allPassed = true;

      problem.testCases.forEach((tc, index) => {
        // Construct a runner
        // We need to parse inputs. inputs are strings like "nums = [2,7,11,15], target = 9" or just raw values?
        // The seed data has inputs like "nums = ...". This is tricky to parse safely.
        // Let's assume for this MVP we just hardcode/expect simple arguments or we manually parse in the seed for "testCases" to be JSON args.

        // Actually, my seed data `testCases` had: { input: '[2,7,11,15], 9', output: '[0,1]' }
        // So `input` is a string suitable for function arguments.

        // We need to find the function name.
        // Heuristic: match `var (\w+) =` or `function (\w+)`
        const match = code.match(/var\s+(\w+)\s*=|function\s+(\w+)\s*\(/);
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
          const expected = JSON.parse(tc.output); // Input output strings in seed are JSON-ish
          const resultJson = JSON.stringify(result);
          const expectedJson = JSON.stringify(expected);

          if (resultJson === expectedJson) {
            logs.push(`Test Case ${index + 1}: Passed`);
          } else {
            logs.push(
              `Test Case ${
                index + 1
              }: Failed. Expected ${expectedJson}, got ${resultJson}`
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
              {/* Submit button would call API to save result */}
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium text-sm transition"
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
