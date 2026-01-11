
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Problem from "@/lib/db/models/Problem";

interface MockProblem {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  starterCode: {
    javascript: string;
  };
  testCases: Array<{ input: string; output: string }>;
  hints: string[];
  resources: Array<{ title: string; url: string; type?: string }>;
  solution?: {
    title: string;
    explanation: string; // Markdown
    code: Record<string, string>;
  };
}

const MOCK_PROBLEMS_DETAILS: Record<string, MockProblem> = {
  "two-sum": {
    _id: "1",
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`
`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`
    },
    testCases: [
      { input: '[2,7,11,15], 9', output: '[0,1]' },
      { input: '[3,2,4], 6', output: '[1,2]' },
      { input: '[3,3], 6', output: '[0,1]' }
    ],
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be slow.",
      "The best way to maintain a mapping of each element in the array to its index?",
    ],
    resources: [
      {
        title: "Hash Table - LeetCode",
        url: "https://leetcode.com/tag/hash-table/",
        type: "Article"
      },
      {
        title: "Two Sum Solution Explained",
        url: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
        type: "Video"
      }
    ],
    solution: {
      title: "One-pass Hash Table",
      explanation: `
We can solve this problem in O(n) time using a hash map.

1. Create an empty hash map.
2. Iterate through the array.
3. For each element \`nums[i]\`, calculate \`complement = target - nums[i]\`.
4. Check if \`complement\` exists in the hash map.
   - If it does, we found the pair! Return \`[map[complement], i]\`.
   - If not, add \`nums[i]\` to the map with its index \`i\`.
`,
      code: {
        javascript: `var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
};`
      }
    }
  },
  "palindrome-number": {
    _id: "2",
    title: 'Palindrome Number',
    slug: 'palindrome-number',
    difficulty: 'Easy',
    description: "Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.",
    starterCode: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    
};`
    },
    testCases: [
      { input: '121', output: 'true' },
      { input: '-121', output: 'false' }
    ],
    hints: [
      "Beware of overflow when reversing the integer.",
      "You can solve this without converting the integer to a string.",
    ],
    resources: [],
    solution: {
        title: "Revert half of the number",
        explanation: `
1. Handle edge cases: negative numbers are not palindromes.
2. Revert the last half of the number.
3. Compare the first half with the reverted second half.
        `,
        code: {
            javascript: `var isPalindrome = function(x) {
    if (x < 0 || (x % 10 === 0 && x !== 0)) {
        return false;
    }
    let revertedNumber = 0;
    while (x > revertedNumber) {
        revertedNumber = revertedNumber * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    return x === revertedNumber || x === Math.floor(revertedNumber / 10);
};`
        }
    }
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    try {
        await dbConnect();
        const problem = await Problem.findOne({ slug });

        if (!problem) {
             // Fallback to mock if not found in real DB (or if connection failed)
             throw new Error("Not found");
        }

        // Merge with mock data if specific fields are missing in the DB record
        // This ensures old DB records still get the new features
        const problemObj = problem.toObject ? problem.toObject() : problem;
        const mock = MOCK_PROBLEMS_DETAILS[slug];
        
        if (mock) {
            if (!problemObj.hints || problemObj.hints.length === 0) {
                problemObj.hints = mock.hints;
            }
            if (!problemObj.resources || problemObj.resources.length === 0) {
                problemObj.resources = mock.resources;
            }
            if (!problemObj.solution) {
                problemObj.solution = mock.solution;
            }
        }

         return NextResponse.json({ success: true, problem: problemObj });
    } catch (dbError) {
         console.warn("DB lookup failed or not found, trying mock:", dbError);
         const mock = MOCK_PROBLEMS_DETAILS[slug];
         if (mock) {
             return NextResponse.json({ success: true, problem: mock });
         }
         return NextResponse.json(
            { success: false, error: "Problem not found" },
            { status: 404 }
        );
    }

  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}
