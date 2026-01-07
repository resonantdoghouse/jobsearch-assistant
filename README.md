# Job Search Assistant

An AI-powered application designed to assist developers in their job search process. Built with Next.js, TypeScript, Tailwind CSS, MongoDB, and Google's Gemini AI.

## Features

### 1. Resume Review

- **Upload**: Support for PDF and DOCX files.
- **AI Analysis**: detailed feedback on technical skills, project descriptions, and formatting.
- **Optimization**: tailored advice for passing ATS (Applicant Tracking Systems) and appealing to technical recruiters.

### 2. Cover Letter Generator

- **Customized Content**: Generates professional cover letters based on specific job details (Title, Company, Description).
- **Context Aware**: Uses your uploaded or pasted resume content to highlight relevant experience.

### 3. User Accounts & Dashboard

- **Authentication**: Secure login via GitHub (using NextAuth.js).
- **Data Persistence**: Save resumes and cover letters to MongoDB.
- **Dashboard**: Track your application materials and history.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (with Mongoose)
- **Authentication**: NextAuth.js v5 (GitHub Provider)
- **AI Model**: Google Gemini (via `@google/generative-ai`)
- **PDF Processing**: `pdf2json`

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
2.  **Dashboard**: View your saved resumes and cover letters.
3.  **Resume Review**: Navigate to `/resume-review`, upload your resume, and wait for the AI analysis.
4.  **Cover Letter**: Navigate to `/cover-letter`, enter the job details and paste your resume text to generate a draft.

## License

[MIT](LICENSE)
