import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="space-y-6 max-w-4xl pt-12 mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 text-gray-900">
          Land Your Dream <span className="text-[#0a66c2]">Developer Job</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered tools to optimize your resume, generate tailored cover
          letters, and streamline your job search.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/resume-review"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white bg-[#0a66c2] rounded-md hover:bg-[#004182] transition-colors"
          >
            Review My Resume
          </Link>
          <Link
            href="/cover-letter"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold text-[#0a66c2] bg-white border border-[#0a66c2] rounded-md hover:bg-blue-50 transition-colors"
          >
            Write Cover Letter
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 text-left">
        <FeatureCard
          title="Smart Resume Review"
          description="Get clear, actionable feedback. We check for ATS compatibility, impact metrics, and keywords."
          href="/resume-review"
        />
        <FeatureCard
          title="Cover Letter Generator"
          description="Generate professional, customized cover letters in seconds given a job description."
          href="/cover-letter"
        />
        <FeatureCard
          title="Interview Prep"
          description="Practice with AI-generated questions tailored to your target role and tech stack."
          href="/dashboard/interview-prep"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-[#0a66c2] transition-all duration-200"
    >
      <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:underline decoration-[#0a66c2] underline-offset-2">
        {title} &rarr;
      </h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </Link>
  );
}
