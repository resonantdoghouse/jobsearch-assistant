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
  const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const [problemsRes, submissionsRes] = await Promise.all([
          fetch("/api/problems"),
          // We need to fetch user submissions. Since this is a client component, we need an endpoint.
          // We can use a new endpoint or reusing filtering?
          // Actually, the `DashboardClient` got them passed in server component.
          // Here we are in Client Component. We need a way to know solved status.
          // Best way: create a new API endpoint `/api/user/submissions` or similar,
          // OR just filter by fetching from a hypothetical endpoint.
          // Let's assume we can fetch from a new endpoint `GET /api/submissions?status=Accepted`
          // OR better, let's just make `InterviewPrepPage` a server component too?
          // Wait, user asked to simply show it.
          // I'll assume I can add a `userId` query param to the submission fetch if I knew the userId.
          // But I don't have userId easily here without prop drilling or context.

          // Simplest solution for now: Fetch all problems and *also* fetch the user's solved problems.
          // I'll create a simple API endpoint for this or just fetch all submissions for the user.
          // Wait, I created `/api/problems/[slug]/submission`.

          // Let's create `GET /api/submissions` which returns user's submissions.
          fetch("/api/submissions/solved"),
        ]);

        const problemsData = await problemsRes.json();

        // I need to implement `/api/submissions/solved`.
        // Or I can just fetch them if I had the endpoint.
        // Let's assume I will create it.
        const submissionsData = await submissionsRes.json();

        if (problemsData.success) {
          setProblems(problemsData.problems);
        }

        if (submissionsData.success) {
          const ids = new Set(
            submissionsData.submissions.map((s: any) => s.problemId),
          );
          setSolvedProblemIds(ids as Set<string>);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Coding Interview Preparation</h1>
      <p className="mb-8 text-gray-600">
        Practice common coding problems to keep your skills sharp.
      </p>

      {loading ? (
        <div className="flex justify-center">Loading problems...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problems.map((problem) => {
                const isSolved = solvedProblemIds.has(problem._id);
                return (
                  <tr key={problem._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {problem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        problem.difficulty === "Easy"
                          ? "bg-green-100 text-green-800"
                          : problem.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/interview-prep/${problem.slug}`}
                        className={
                          isSolved
                            ? "text-green-600 hover:text-green-900 font-bold"
                            : "text-indigo-600 hover:text-indigo-900"
                        }
                      >
                        {isSolved ? "Solved" : "Solve"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {problems.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
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
