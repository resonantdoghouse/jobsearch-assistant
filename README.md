# Job Search Assistant

An AI-powered application designed to assist developers in their job search process. Built with Next.js, TypeScript, Tailwind CSS, MongoDB, and Google's Gemini AI.

## Features

### 1. Resume Review & Editing

- **Smart Analysis**: Upload PDF/DOCX resumes for instant AI feedback on skills, impact, and formatting.
- **Developer-Centric**: Specialized prompts ensure "Software Engineering" focus, enforcing strict professional standards (no emojis/icons).
- **Interactive Q&A**: If your resume is missing critical info for a strong developer profile, the AI will ask you specific questions instead of inventing data.
- **Visual Version Control**: Review changes with a **visual diff** tool before saving updates, ensuring you never lose important details.
- **Resume Templates**: Choose from 5 professional templates, including **"Minimalist Dev"** and **"Tech Impact"** designed specifically for engineers.
- **Customization**: Reorder your projects with a simple click to highlight your most relevant work.

### 2. Cover Letter Generator

- **Tailored Content**: Generates professional cover letters based on specific job descriptions and company details.
- **Context Aware**: Uses your resume's experience to highlight relevant skills for the target role.

### 3. Interview Preparation

- **Coding Challenges**: Practice with built-in coding problems similar to technical interviews.
- **Integrated Code Editor**: Write and run code directly in the browser (powered by Monaco Editor).
- **AI Feedback**: Get instant assessment on your solutions.

### 4. Advanced Dashboard

- **Centralized Hub**: Track all your saved resumes, cover letters, and analysis sessions.
- **Organization**: Star/Favorite important items for quick access.
- **Sorting**: Easily sort content by date or favorites.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (with Mongoose)
- **Authentication**: NextAuth.js v5 (GitHub Provider)
- **AI Model**: Google Gemini (via `@google/generative-ai`)
- **Editor**: Monaco Editor (React)
- **Utilities**: `diff` (Text comparison), `pdf2json`, `mammoth` (Doc processing)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A **MongoDB Atlas** account (or local MongoDB instance).
- A **GitHub OAuth Application** (for authentication).
- A **Google Cloud API Key** (for Gemini AI).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/resonantdoghouse/jobsearch-assistant.git
    cd jobsearch-assistant
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Copy the example environment file:

    ```bash
    cp .env.example .env.local
    ```

    Open `.env.local` and fill in your credentials:
    - `MONGODB_URI`: Your MongoDB connection string.
    - `AUTH_GITHUB_ID`: GitHub OAuth Client ID.
    - `AUTH_GITHUB_SECRET`: GitHub OAuth Client Secret.
    - `AUTH_SECRET`: A random string for encryption (generate with `npx auth secret`).
    - `GEMINI_API_KEY`: Your Google Gemini API Key.

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usages

1.  **Sign In**: Click "Sign in" to log in with your GitHub account.
2.  **Dashboard**: Manage your career assets. Star important resumes or review past cover letters.
3.  **Resume Review**: Upload a resume to get AI feedback. Enter "Edit" mode to refine content and use the "AI Rewrite" tools.
4.  **Interview Prep**: Navigate to the Interview Prep section to solve coding challenges.

## License

[MIT](LICENSE)
