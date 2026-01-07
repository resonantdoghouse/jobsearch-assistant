import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Land Your Dream Developer Job
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-10">
        AI-powered tools to optimize your resume, generate tailored cover letters, and streamline your job search process.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <FeatureCard 
          title="Resume Review" 
          description="Get expert feedback on your resume tailored for developer roles. Improve your chances of passing ATS."
          href="/resume-review"
        />
        <FeatureCard 
          title="Cover Letter Gen" 
          description="Generate professional, customized cover letters in seconds based on the job description and your skills."
          href="/cover-letter"
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200">
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">{title} &rarr;</h2>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
