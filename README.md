# Job Search Assistant

An AI-powered application designed to assist developers in their job search process. Built with Next.js, TypeScript, Tailwind CSS, and Google's Gemini AI.

## Features

### 1. Resume Review

- **Upload**: Support for PDF and DOCX files.
- **AI Analysis**: detailed feedback on technical skills, project descriptions, and formatting.
- **Optimization**: tailored advice for passing ATS (Applicant Tracking Systems) and appealing to technical recruiters.

### 2. Cover Letter Generator

- **Customized Content**: Generates professional cover letters based on specific job details (Title, Company, Description).
- **Context Aware**: Uses your uploaded or pasted resume content to highlight relevant experience.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini (via `@google/generative-ai`)
- **PDF Processing**: `pdf2json`

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Cloud API Key for Gemini.

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
    Create a `.env.local` file in the root directory and add your Gemini API key:

    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usages

1.  **Resume Review**: Navigate to `/resume-review`, upload your resume, and wait for the AI analysis.
2.  **Cover Letter**: Navigate to `/cover-letter`, enter the job details and paste your resume text to generate a draft.

## License

[MIT](LICENSE)
