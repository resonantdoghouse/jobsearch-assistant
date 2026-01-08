
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export default function InterviewPrepPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch("/api/problems");
        const data = await res.json();
        if (data.success) {
          setProblems(data.problems);
        }
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Coding Interview Preparation</h1>
      <p className="mb-8 text-gray-600">Practice common coding problems to key your skills sharp.</p>
      
      {loading ? (
        <div className="flex justify-center">Loading problems...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problems.map((problem) => (
                <tr key={problem._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{problem.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/interview-prep/${problem.slug}`} className="text-indigo-600 hover:text-indigo-900">
                      Solve
                    </Link>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                 <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No problems found.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
