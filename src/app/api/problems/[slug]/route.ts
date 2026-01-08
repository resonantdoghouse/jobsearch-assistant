
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Problem from "@/lib/db/models/Problem";

const MOCK_PROBLEMS_DETAILS: Record<string, any> = {
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
    ]
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
    ]
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
         return NextResponse.json({ success: true, problem });
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
