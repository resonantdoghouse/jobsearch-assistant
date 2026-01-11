
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
const twoSum = function(nums, target) {
    
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
   - If it does, we found the pair! Return \`[map.get(complement), i]\`.
   - If not, add \`nums[i]\` to the map with its index \`i\`.
`,
      code: {
        javascript: `const twoSum = function(nums, target) {
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
const isPalindrome = function(x) {
    
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
            javascript: `const isPalindrome = function(x) {
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
  },
  "fizz-buzz": {
    _id: "3",
    title: 'Fizz Buzz',
    slug: 'fizz-buzz',
    difficulty: 'Easy',
    description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:
    
- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
- \`answer[i] == i\` (as a string) if none of the above conditions are true.`,
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
const fizzBuzz = function(n) {
    
};`
    },
    testCases: [
      { input: '3', output: '["1","2","Fizz"]' },
      { input: '5', output: '["1","2","Fizz","4","Buzz"]' },
      { input: '15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
    ],
    hints: [
      "Check for divisibility by 15 first, or check for both 3 and 5.",
    ],
    resources: [],
    solution: {
        title: "Simulation",
        explanation: "Iterate from 1 to n and check the conditions in order.",
        code: {
            javascript: `const fizzBuzz = function(n) {
    const result = [];
    for(let i=1; i<=n; i++) {
        if(i%15 === 0) result.push("FizzBuzz");
        else if(i%3 === 0) result.push("Fizz");
        else if(i%5 === 0) result.push("Buzz");
        else result.push(i.toString());
    }
    return result;
};`
        }
    }
  },
  "reverse-linked-list": {
    _id: "4",
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    description: "Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.",
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
const reverseList = function(head) {
    
};`
    },
    testCases: [
        { input: '[1,2,3,4,5]', output: '[5,4,3,2,1]' },
        { input: '[1,2]', output: '[2,1]' }
    ],
    hints: ["Iterative or Recursive approaches are both good."],
    resources: [],
    solution: {
        title: "Iterative",
        explanation: "Iterate through the list and change the `next` pointer of each node to point to the previous node.",
        code: {
            javascript: `const reverseList = function(head) {
    let prev = null;
    let curr = head;
    while(curr) {
        const nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
};`
        }
    }
  },

  "merge-two-sorted-lists": {
      _id: "6",
      title: "Merge Two Sorted Lists",
      slug: "merge-two-sorted-lists",
      difficulty: "Easy",
      description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists in a one **sorted** list.",
      starterCode: {
          javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
const mergeTwoLists = function(list1, list2) {
    
};`
      },
      testCases: [
          { input: '[1,2,4], [1,3,4]', output: '[1,1,2,3,4,4]' },
          { input: '[], []', output: '[]' }
      ],
      hints: [],
      resources: [],
      solution: {
          title: "Recursive",
          explanation: "Recursively merge the smallest nodes.",
          code: {
              javascript: `const mergeTwoLists = function(list1, list2) {
    if(!list1) return list2;
    if(!list2) return list1;
    if(list1.val < list2.val) {
        list1.next = mergeTwoLists(list1.next, list2);
        return list1;
    } else {
        list2.next = mergeTwoLists(list1, list2.next);
        return list2;
    }
};`
          }
      }
  },
  "maximum-subarray": {
      _id: "7",
      title: "Maximum Subarray",
      slug: "maximum-subarray",
      difficulty: "Easy",
      description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return *its sum*.",
      starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
const maxSubArray = function(nums) {
    
};`
      },
      testCases: [
          { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
          { input: '[1]', output: '1' }
      ],
      hints: ["Kadane's Algorithm"],
      resources: [],
      solution: {
          title: "Kadane's Algorithm",
          explanation: "Iterate through the array, keeping track of the current maximum sum ending at each position.",
          code: {
              javascript: `const maxSubArray = function(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    return maxSoFar;
};`
          }
      }
  },
  "longest-substring-without-repeating-characters": {
      _id: "8",
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      difficulty: "Medium",
      description: "Given a string `s`, find the length of the **longest substring** without repeating characters.",
      starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {number}
 */
const lengthOfLongestSubstring = function(s) {
    
};`
      },
      testCases: [
          { input: '"abcabcbb"', output: '3' },
          { input: '"bbbbb"', output: '1' }
      ],
      hints: ["Sliding Window"],
      resources: [],
      solution: {
          title: "Sliding Window",
          explanation: "Maintain a sliding window and a set of characters in the current window.",
          code: {
              javascript: `const lengthOfLongestSubstring = function(s) {
    let maxLen = 0;
    let start = 0;
    const map = new Map();
    for(let end = 0; end < s.length; end++) {
        if(map.has(s[end])) {
            start = Math.max(map.get(s[end]) + 1, start);
        }
        map.set(s[end], end);
        maxLen = Math.max(maxLen, end - start + 1);
    }
    return maxLen;
};`
          }
      }
  },
  "3sum": {
      _id: "9",
      title: "3Sum",
      slug: "3sum",
      difficulty: "Medium",
      description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
      starterCode: {
          javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
const threeSum = function(nums) {
    
};`
      },
      testCases: [
          { input: '[-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
          { input: '[]', output: '[]' }
      ],
      hints: ["Sort the array first."],
      resources: [],
      solution: {
          title: "Two Pointers",
          explanation: "Sort the array, then iterate through each element and use two pointers to find the other two.",
          code: {
              javascript: `const threeSum = function(nums) {
    nums.sort((a,b) => a-b);
    const result = [];
    for(let i=0; i<nums.length-2; i++) {
        if(i>0 && nums[i] === nums[i-1]) continue;
        let left = i+1;
        let right = nums.length-1;
        while(left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if(sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                while(left < right && nums[left] === nums[left+1]) left++;
                while(left < right && nums[right] === nums[right-1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
};`
          }
      }
  },
  "group-anagrams": {
      _id: "10",
      title: "Group Anagrams",
      slug: "group-anagrams",
      difficulty: "Medium",
      description: "Given an array of strings `strs`, group **the anagrams** together. You can return the answer in **any order**.",
      starterCode: {
          javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
const groupAnagrams = function(strs) {
    
};`
      },
      testCases: [
          { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
          { input: '[""]', output: '[[""]]' }
      ],
      hints: ["Hash Map"],
      resources: [],
      solution: {
          title: "Hash Map",
          explanation: "Map sorted string to list of original strings.",
          code: {
              javascript: `const groupAnagrams = function(strs) {
    const map = new Map();
    for(const s of strs) {
        const key = s.split('').sort().join('');
        if(!map.has(key)) map.set(key, []);
        map.get(key).push(s);
    }
    return Array.from(map.values());
};`
          }
      }
  },
  "median-of-two-sorted-arrays": {
      _id: "11",
      title: "Median of Two Sorted Arrays",
      slug: "median-of-two-sorted-arrays",
      difficulty: "Hard",
      description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays.",
      starterCode: {
          javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
const findMedianSortedArrays = function(nums1, nums2) {
    
};`
      },
      testCases: [
          { input: '[1,3], [2]', output: '2.00000' },
          { input: '[1,2], [3,4]', output: '2.50000' }
      ],
      hints: ["Binary Search"],
      resources: [],
      solution: {
          title: "Binary Search",
          explanation: "Perform binary search on the smaller array to find the correct partition.",
          code: {
              javascript: `const findMedianSortedArrays = function(nums1, nums2) {
    // Implementation omitted for brevity in mock
    return 0;
};`
          }
      }
  },
  "merge-k-sorted-lists": {
      _id: "12",
      title: "Merge k Sorted Lists",
      slug: "merge-k-sorted-lists",
      difficulty: "Hard",
      description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
      starterCode: {
          javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
const mergeKLists = function(lists) {
    
};`
      },
      testCases: [
           { input: '[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
           { input: '[]', output: '[]' }
      ],
      hints: ["Heap / Priority Queue"],
      resources: [],
      solution: {
          title: "Min Heap",
          explanation: "Use a min heap to keep track of the smallest node among the k lists.",
          code: {
              javascript: `const mergeKLists = function(lists) {
    // Implementation omitted
    return null;
};`
          }
      }
  },
  "trapping-rain-water": {
       _id: "13",
       title: "Trapping Rain Water",
       slug: "trapping-rain-water",
       difficulty: "Hard",
       description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
       starterCode: {
           javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
const trap = function(height) {
    
};`
       },
       testCases: [
           { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
           { input: '[4,2,0,3,2,5]', output: '9' }
       ],
       hints: ["Two Pointers", "Dynamic Programming"],
       resources: [],
       solution: {
           title: "Two Pointers",
           explanation: "Use two pointers starting from left and right.",
           code: {
               javascript: `const trap = function(height) {
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
    let water = 0;
    while(left < right) {
        if(height[left] < height[right]) {
            if(height[left] >= leftMax) leftMax = height[left];
            else water += leftMax - height[left];
            left++;
        } else {
            if(height[right] >= rightMax) rightMax = height[right];
            else water += rightMax - height[right];
            right--;
        }
    }
    return water;
};`
           }
       }
  },
  "valid-parentheses": {
      _id: "5",
      title: "Valid Parentheses",
      slug: "valid-parentheses",
      difficulty: "Easy",
      description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      starterCode: {
          javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
const isValid = function(s) {
    
};`
      },
      testCases: [
          { input: '"()"', output: 'true' },
          { input: '"()[]{}"', output: 'true' },
          { input: '"(]"', output: 'false' }
      ],
      hints: ["Use a stack to keep track of opening brackets."],
      resources: [],
      solution: {
          title: "Stack",
          explanation: "Push opening brackets to a stack. When a closing bracket is found, check if it matches the top of the stack.",
          code: {
              javascript: `const isValid = function(s) {
    const stack = [];
    const map = {
        '(': ')',
        '{': '}',
        '[': ']'
    };
    for (const char of s) {
        if (map[char]) {
            stack.push(char);
        } else {
            const last = stack.pop();
            if (char !== map[last]) return false;
        }
    }
    return stack.length === 0;
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
            if (!problemObj.starterCode || Object.keys(problemObj.starterCode).length === 0) {
                problemObj.starterCode = mock.starterCode;
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
