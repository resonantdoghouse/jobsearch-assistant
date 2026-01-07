"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ReactMarkdown from "react-markdown";

interface ResumeData {
  fullName: string;
  contactInfo: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    other?: string[];
  };
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    techStack: string[];
  }>;
}

export function ResumePreview({ content }: { content: ResumeData | string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: typeof content === 'object' ? `${content.fullName.replace(/\s+/g, '_')}_Resume` : "Optimized_Resume",
  });

  if (!content) return null;

  // Fallback for string content (if legacy markdown)
  if (typeof content === 'string') {
      return (
         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h3 className="text-xl font-bold text-gray-900">Preview (Markdown)</h3>
               <button onClick={() => handlePrint && handlePrint()} className="bg-green-600 text-white px-4 py-2 rounded">Download PDF</button>
             </div>
             <div className="bg-gray-50 p-8 rounded-lg overflow-auto">
                <div ref={contentRef} className="bg-white p-[40px] text-gray-800 prose max-w-[210mm] mx-auto min-h-[297mm]">
                   <ReactMarkdown>{content}</ReactMarkdown>
                </div>
             </div>
         </div>
      )
  }

  const { fullName, contactInfo, summary, skills, experience, education, projects } = content;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-900">Professional Resume Preview</h3>
        <button
          onClick={() => handlePrint && handlePrint()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>Download PDF</span>
        </button>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 overflow-auto max-h-[800px]">
        {/* Printable Area - CSS Grid Layout */}
        <div
          ref={contentRef}
          className="bg-white p-[40px] shadow-sm text-gray-900 font-sans max-w-[210mm] mx-auto min-h-[297mm] leading-normal"
          style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header */}
          <header className={"border-b-2 border-slate-800 pb-6 mb-6"}>
            <h1 className="text-4xl font-extrabold uppercase tracking-wide text-slate-900 text-center mb-4">{fullName}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
              {contactInfo.email && <span>📧 {contactInfo.email}</span>}
              {contactInfo.phone && <span>📱 {contactInfo.phone}</span>}
              {contactInfo.location && <span>📍 {contactInfo.location}</span>}
              {contactInfo.linkedin && <span>🔗 {contactInfo.linkedin}</span>}
              {contactInfo.website && <span>🌐 {contactInfo.website}</span>}
            </div>
          </header>

          {/* Summary */}
          {summary && (
            <section className="mb-6">
              <h2 className="text-xl font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Professional Summary</h2>
              <p className="text-slate-700 text-base leading-relaxed">{summary}</p>
            </section>
          )}

          {/* Skills */}
          {skills && (
            <section className="mb-6">
               <h2 className="text-xl font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Technical Skills</h2>
               <div className="grid grid-cols-1 gap-2 text-sm">
                 {skills.languages && skills.languages.length > 0 && (
                    <div className="flex"><span className="font-bold w-32 shrink-0">Languages:</span> <span>{skills.languages.join(", ")}</span></div>
                 )}
                 {skills.frameworks && skills.frameworks.length > 0 && (
                    <div className="flex"><span className="font-bold w-32 shrink-0">Frameworks:</span> <span>{skills.frameworks.join(", ")}</span></div>
                 )}
                 {skills.tools && skills.tools.length > 0 && (
                    <div className="flex"><span className="font-bold w-32 shrink-0">Tools:</span> <span>{skills.tools.join(", ")}</span></div>
                 )}
               </div>
            </section>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Experience</h2>
              <div className="space-y-5">
                {experience.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{job.role}</h3>
                      <span className="text-sm font-semibold text-slate-600">{job.duration}</span>
                    </div>
                    <div className="text-base font-medium text-slate-700 mb-2">{job.company}</div>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                      {job.description.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-lg font-bold text-slate-900">{proj.name}</h3>
                        {proj.techStack && <span className="text-xs text-slate-500 italic">[{proj.techStack.join(", ")}]</span>}
                    </div>
                    <p className="text-sm text-slate-700 mt-1">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

           {/* Education */}
           {education && education.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                        <div className="font-bold text-slate-900">{edu.school}</div>
                        <div className="text-sm text-slate-700">{edu.degree}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-600">{edu.year}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
