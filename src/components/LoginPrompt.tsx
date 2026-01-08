import Link from "next/link";

interface LoginPromptProps {
  title: string;
  description: string;
}

export function LoginPrompt({ title, description }: LoginPromptProps) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-2xl mx-auto">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 shadow-lg shadow-blue-500/30"
          >
            Sign in to Access
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            Learn More
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Join thousands of developers enhancing their job search.
        </p>
      </div>
    </div>
  );
}
