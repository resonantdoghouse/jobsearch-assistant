import mongoose, { Schema, Model } from "mongoose";

export interface IProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface IProblemTestCase {
  input: string;
  output: string;
}

export interface IProblemResource {
  title: string;
  url: string;
  type?: string;
}

export interface IProblemSolution {
  title: string;
  explanation: string;
  code: Record<string, string>;
}

export interface IProblem extends mongoose.Document {
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: IProblemExample[];
  constraints: string[];
  starterCode: Record<string, string>; // language -> code
  testCases: IProblemTestCase[];
  hints: string[];
  resources: IProblemResource[];
  solution?: IProblemSolution;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemExampleSchema = new Schema<IProblemExample>({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
});

const ProblemTestCaseSchema = new Schema<IProblemTestCase>({
  input: { type: String, required: true },
  output: { type: String, required: true },
});

const ProblemResourceSchema = new Schema<IProblemResource>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String },
});

const ProblemSolutionSchema = new Schema<IProblemSolution>({
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  code: { type: Map, of: String, required: true },
});

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    description: { type: String, required: true }, // Markdown
    examples: [ProblemExampleSchema],
    constraints: [{ type: String }],
    starterCode: { type: Map, of: String },
    testCases: [ProblemTestCaseSchema],
    hints: [{ type: String }],
    resources: [ProblemResourceSchema],
    solution: ProblemSolutionSchema,
  },
  { timestamps: true }
);

// Check if model exists to avoid recompilation errors in dev
const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>("Problem", ProblemSchema);

export default Problem;
