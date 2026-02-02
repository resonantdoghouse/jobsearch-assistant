"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ToastContext";
import { ResumeDiffViewer } from "./ResumeDiffViewer";

export interface ResumeData {
  fullName: string;
  contactInfo: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  sectionTitles?: {
    summary?: string;
    skills?: string;
    experience?: string;
    education?: string;
    projects?: string;
    languages?: string;
    frameworks?: string;
    tools?: string;
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

export type ResumeFormat = "standard" | "professional" | "modern";

export function ResumePreview({
  content,
  analysis,
  isEditable = false,
  format = "standard", // Default format
  onSave,
}: {
  content: ResumeData | string;
  analysis?: string;
  isEditable?: boolean;
  format?: ResumeFormat;
  onSave?: (updatedContent: ResumeData) => Promise<void>;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);

  // Initialize editedContent ensuring proper defaults for sectionTitles
  const initializeContent = (c: ResumeData | string): ResumeData | null => {
    if (typeof c !== "object") return null;
    try {
      return {
        ...JSON.parse(JSON.stringify(c)),
        sectionTitles: {
          summary: "Professional Summary",
          skills: "Technical Skills",
          experience: "Experience",
          education: "Education",
          projects: "Projects",
          languages: "Languages",
          frameworks: "Frameworks",
          tools: "Tools",
          ...c.sectionTitles,
        },
      };
    } catch {
      return null;
    }
  };

  const [editedContent, setEditedContent] = useState<ResumeData | null>(
    initializeContent(content),
  );
  const { success, error } = useToast();

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle:
      typeof content === "object"
        ? `${content.fullName?.replace(/\s+/g, "_")}_Resume`
        : "Optimized_Resume",
  });

  const handleSaveClick = async () => {
    if (isEditing && editedContent) {
      // Check if content actually changed
      if (JSON.stringify(content) !== JSON.stringify(editedContent)) {
        setShowDiffModal(true);
        return;
      }
    }
    // If not editing, or no changes, just save (or if just saving to dashboard from review)
    await confirmSave();
  };

  const confirmSave = async () => {
    setShowDiffModal(false);
    setIsSaving(true);
    try {
      if (isEditing && onSave && editedContent) {
        await onSave(editedContent);
        setIsEditing(false);
      } else {
        // Original save logic for internal API
        const title =
          typeof content === "object"
            ? `${content.fullName}'s Resume`
            : "My Resume";

        // Use editedContent if available (e.g. slight tweaks before initial save), else content
        const contentToSave =
          isEditing && editedContent ? editedContent : content;

        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content: contentToSave,
            analysis,
          }),
        });

        if (res.ok) {
          success("Resume saved successfully to your Dashboard!");
          // If we were editing (even internally), stop editing
          setIsEditing(false);
        } else {
          const err = await res.json();
          if (res.status === 401) {
            error("You must be logged in to save resumes.");
          } else {
            error(`Failed to save: ${err.error || "Unknown error"}`);
          }
        }
      }
    } catch (e) {
      console.error(e);
      error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof ResumeData, value: any) => {
    if (!editedContent) return;
    setEditedContent({ ...editedContent, [field]: value });
  };

  const updateNestedField = (
    parent: keyof ResumeData,
    field: string,
    value: any,
  ) => {
    if (!editedContent) return;
    setEditedContent({
      ...editedContent,
      [parent]: {
        ...(editedContent[parent] as any),
        [field]: value,
      },
    });
  };

  if (!content) return null;

  // Fallback for string content (if legacy markdown)
  if (typeof content === "string") {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Preview (Markdown)
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save to Dashboard"}
            </button>
            <button
              onClick={() => handlePrint && handlePrint()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-8 rounded-lg overflow-auto">
          <div
            ref={contentRef}
            className="bg-white p-[40px] text-gray-800 prose max-w-[210mm] mx-auto min-h-[297mm]"
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Use edited content if editing, otherwise original content (with defaults applied)
  const displayContent =
    isEditing && editedContent
      ? editedContent
      : initializeContent(content) || (content as ResumeData);

  const {
    fullName,
    contactInfo,
    sectionTitles = {
      summary: "Professional Summary",
      skills: "Technical Skills",
      experience: "Experience",
      education: "Education",
      projects: "Projects",
      languages: "Languages",
      frameworks: "Frameworks",
      tools: "Tools",
    },
    summary,
    skills,
    experience,
    education,
    projects,
  } = displayContent;

  const getFormatStyles = () => {
    switch (format) {
      case "professional":
        return {
          container:
            "bg-white p-[40px] shadow-sm text-gray-900 font-serif max-w-[210mm] mx-auto min-h-[297mm] leading-relaxed",
          header: "border-b-2 border-gray-800 pb-6 mb-8 text-center",
          name: "text-3xl font-bold uppercase tracking-widest text-gray-900 mb-3",
          contact:
            "flex flex-wrap justify-center gap-4 text-sm text-gray-700 italic",
          sectionTitle:
            "text-lg font-bold uppercase border-b border-gray-400 pb-1 mb-4 text-gray-900 tracking-wider",
          role: "text-lg font-bold text-gray-900",
          company: "text-base font-semibold text-gray-800 italic mb-1",
          techStack: "text-xs text-gray-600 italic",
        };
      case "modern":
        return {
          container:
            "bg-white p-[40px] shadow-sm text-slate-800 font-sans max-w-[210mm] mx-auto min-h-[297mm] leading-relaxed",
          header: "mb-8 pb-6 border-b-2 border-indigo-500",
          name: "text-5xl font-black tracking-tighter text-indigo-900 mb-2",
          contact: "flex flex-wrap gap-4 text-sm text-slate-500 font-medium",
          sectionTitle:
            "text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2 border-l-4 border-indigo-500 pl-3 uppercase tracking-wide",
          role: "text-xl font-bold text-slate-900",
          company: "text-base font-medium text-indigo-600 mb-2",
          techStack: "text-xs text-indigo-500 font-semibold",
        };
      case "standard":
      default:
        return {
          container:
            "bg-white p-[40px] shadow-sm text-gray-900 font-sans max-w-[210mm] mx-auto min-h-[297mm] leading-normal",
          header: "border-b-2 border-slate-800 pb-6 mb-6",
          name: "text-4xl font-extrabold uppercase tracking-wide text-slate-900 text-center mb-4",
          contact: "flex flex-wrap justify-center gap-4 text-sm text-slate-600",
          sectionTitle:
            "text-xl font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3 text-slate-800",
          role: "text-lg font-bold text-slate-900",
          company: "text-base font-medium text-slate-700 mb-2",
          techStack: "text-xs text-slate-500 italic",
        };
    }
  };

  const styles = getFormatStyles();

  return (
    <>
      {showDiffModal && editedContent && typeof content === "object" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Review Changes
                </h3>
                <p className="text-sm text-gray-500">
                  Please review differences before saving.
                </p>
              </div>
              <button
                onClick={() => setShowDiffModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <ResumeDiffViewer
                oldData={content as ResumeData}
                newData={editedContent}
              />
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setShowDiffModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Professional Resume Preview
          </h3>
          <div className="flex gap-3">
            {isEditable && (
              <button
                onClick={() => {
                  if (isEditing) {
                    // Cancel editing - reset content
                    setEditedContent(initializeContent(content));
                    setIsEditing(false);
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                  isEditing
                    ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {isEditing ? "Cancel Editing" : "Edit Resume"}
              </button>
            )}

            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Save to Dashboard"}
            </button>
            {!isEditing && (
              <button
                onClick={() => handlePrint && handlePrint()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 overflow-auto max-h-[800px]">
          {/* Printable Area - CSS Grid Layout */}
          <div
            ref={contentRef}
            className={styles.container}
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            {/* Header */}
            <header className={styles.header}>
              {isEditing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={`${styles.name} w-full border-b border-dashed border-gray-300 focus:border-indigo-500 focus:outline-none`}
                  placeholder="Full Name"
                />
              ) : (
                <h1 className={styles.name}>{fullName}</h1>
              )}

              <div className={styles.contact}>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 w-full max-w-lg mx-auto">
                    <input
                      value={contactInfo.email}
                      onChange={(e) =>
                        updateNestedField(
                          "contactInfo",
                          "email",
                          e.target.value,
                        )
                      }
                      placeholder="Email"
                      className="border p-1 rounded"
                    />
                    <input
                      value={contactInfo.phone}
                      onChange={(e) =>
                        updateNestedField(
                          "contactInfo",
                          "phone",
                          e.target.value,
                        )
                      }
                      placeholder="Phone"
                      className="border p-1 rounded"
                    />
                    <input
                      value={contactInfo.location}
                      onChange={(e) =>
                        updateNestedField(
                          "contactInfo",
                          "location",
                          e.target.value,
                        )
                      }
                      placeholder="Location"
                      className="border p-1 rounded"
                    />
                    <input
                      value={contactInfo.linkedin || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "contactInfo",
                          "linkedin",
                          e.target.value,
                        )
                      }
                      placeholder="LinkedIn"
                      className="border p-1 rounded"
                    />
                    <input
                      value={contactInfo.website || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "contactInfo",
                          "website",
                          e.target.value,
                        )
                      }
                      placeholder="Website"
                      className="border p-1 rounded"
                    />
                  </div>
                ) : (
                  <>
                    {contactInfo.email && <span>📧 {contactInfo.email}</span>}
                    {contactInfo.phone && <span>📱 {contactInfo.phone}</span>}
                    {contactInfo.location && (
                      <span>📍 {contactInfo.location}</span>
                    )}
                    {contactInfo.linkedin && (
                      <span>🔗 {contactInfo.linkedin}</span>
                    )}
                    {contactInfo.website && (
                      <span>🌐 {contactInfo.website}</span>
                    )}
                  </>
                )}
              </div>
            </header>

            {/* Summary */}
            {(summary || isEditing) && (
              <section className="mb-6">
                {isEditing ? (
                  <input
                    value={sectionTitles.summary}
                    onChange={(e) =>
                      updateNestedField(
                        "sectionTitles",
                        "summary",
                        e.target.value,
                      )
                    }
                    className={`${styles.sectionTitle} w-full border-dashed focus:border-indigo-500 focus:outline-none`}
                  />
                ) : (
                  <h2 className={styles.sectionTitle}>
                    {sectionTitles.summary}
                  </h2>
                )}

                {isEditing ? (
                  <textarea
                    value={summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    className="w-full h-32 p-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                    placeholder="Write your professional summary..."
                  />
                ) : (
                  <p className="text-slate-700 text-base leading-relaxed">
                    {summary}
                  </p>
                )}
              </section>
            )}

            {/* Skills */}
            {(skills || isEditing) && (
              <section className="mb-6">
                {isEditing ? (
                  <input
                    value={sectionTitles.skills}
                    onChange={(e) =>
                      updateNestedField(
                        "sectionTitles",
                        "skills",
                        e.target.value,
                      )
                    }
                    className={`${styles.sectionTitle} w-full border-dashed focus:border-indigo-500 focus:outline-none`}
                  />
                ) : (
                  <h2 className={styles.sectionTitle}>
                    {sectionTitles.skills}
                  </h2>
                )}

                {isEditing ? (
                  <div className="space-y-2">
                    <div>
                      <input
                        value={sectionTitles.languages}
                        onChange={(e) =>
                          updateNestedField(
                            "sectionTitles",
                            "languages",
                            e.target.value,
                          )
                        }
                        className="text-xs font-bold text-gray-500 w-full border-b border-dashed mb-1 focus:border-indigo-500 focus:outline-none"
                        placeholder="Languages (comma separated)"
                      />
                      <input
                        value={skills.languages.join(", ")}
                        onChange={(e) =>
                          updateNestedField(
                            "skills",
                            "languages",
                            e.target.value.split(",").map((s) => s.trim()),
                          )
                        }
                        className="w-full border p-1 rounded"
                      />
                    </div>
                    <div>
                      <input
                        value={sectionTitles.frameworks}
                        onChange={(e) =>
                          updateNestedField(
                            "sectionTitles",
                            "frameworks",
                            e.target.value,
                          )
                        }
                        className="text-xs font-bold text-gray-500 w-full border-b border-dashed mb-1 focus:border-indigo-500 focus:outline-none"
                        placeholder="Frameworks (comma separated)"
                      />
                      <input
                        value={skills.frameworks.join(", ")}
                        onChange={(e) =>
                          updateNestedField(
                            "skills",
                            "frameworks",
                            e.target.value.split(",").map((s) => s.trim()),
                          )
                        }
                        className="w-full border p-1 rounded"
                      />
                    </div>
                    <div>
                      <input
                        value={sectionTitles.tools}
                        onChange={(e) =>
                          updateNestedField(
                            "sectionTitles",
                            "tools",
                            e.target.value,
                          )
                        }
                        className="text-xs font-bold text-gray-500 w-full border-b border-dashed mb-1 focus:border-indigo-500 focus:outline-none"
                        placeholder="Tools (comma separated)"
                      />
                      <input
                        value={skills.tools.join(", ")}
                        onChange={(e) =>
                          updateNestedField(
                            "skills",
                            "tools",
                            e.target.value.split(",").map((s) => s.trim()),
                          )
                        }
                        className="w-full border p-1 rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {skills.languages && skills.languages.length > 0 && (
                      <div className="flex">
                        <span className="font-bold w-32 shrink-0">
                          {sectionTitles.languages}:
                        </span>{" "}
                        <span>{skills.languages.join(", ")}</span>
                      </div>
                    )}
                    {skills.frameworks && skills.frameworks.length > 0 && (
                      <div className="flex">
                        <span className="font-bold w-32 shrink-0">
                          {sectionTitles.frameworks}:
                        </span>{" "}
                        <span>{skills.frameworks.join(", ")}</span>
                      </div>
                    )}
                    {skills.tools && skills.tools.length > 0 && (
                      <div className="flex">
                        <span className="font-bold w-32 shrink-0">
                          {sectionTitles.tools}:
                        </span>{" "}
                        <span>{skills.tools.join(", ")}</span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Experience */}
            {((experience && experience.length > 0) || isEditing) && (
              <section className="mb-6">
                {isEditing ? (
                  <input
                    value={sectionTitles.experience}
                    onChange={(e) =>
                      updateNestedField(
                        "sectionTitles",
                        "experience",
                        e.target.value,
                      )
                    }
                    className={`${styles.sectionTitle} w-full border-dashed focus:border-indigo-500 focus:outline-none`}
                  />
                ) : (
                  <h2 className={styles.sectionTitle}>
                    {sectionTitles.experience}
                  </h2>
                )}

                <div className="space-y-5">
                  {experience.map((job, idx) => (
                    <div key={idx} className="relative group">
                      {isEditing && (
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const newExp = [...experience];
                              newExp.splice(idx, 1);
                              updateField("experience", newExp);
                            }}
                            className="text-red-500 bg-white border border-red-200 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline mb-1">
                        {isEditing ? (
                          <input
                            value={job.role}
                            onChange={(e) => {
                              const newExp = [...experience];
                              newExp[idx] = { ...job, role: e.target.value };
                              updateField("experience", newExp);
                            }}
                            className={`${styles.role} border-b border-dashed border-gray-300 w-1/2`}
                            placeholder="Role"
                          />
                        ) : (
                          <h3 className={styles.role}>{job.role}</h3>
                        )}
                        {isEditing ? (
                          <input
                            value={job.duration}
                            onChange={(e) => {
                              const newExp = [...experience];
                              newExp[idx] = {
                                ...job,
                                duration: e.target.value,
                              };
                              updateField("experience", newExp);
                            }}
                            className="text-sm font-semibold text-slate-600 text-right border-b border-dashed border-gray-300 w-1/3"
                            placeholder="Duration"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-slate-600">
                            {job.duration}
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <input
                          value={job.company}
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[idx] = { ...job, company: e.target.value };
                            updateField("experience", newExp);
                          }}
                          className={`${styles.company} w-full border-b border-dashed border-gray-300`}
                          placeholder="Company"
                        />
                      ) : (
                        <div className={styles.company}>{job.company}</div>
                      )}
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        {job.description.map((point, i) => (
                          <li key={i}>
                            {isEditing ? (
                              <textarea
                                value={point}
                                onChange={(e) => {
                                  const newExp = [...experience];
                                  const newJob = { ...newExp[idx] };
                                  const newDesc = [...newJob.description];
                                  newDesc[i] = e.target.value;
                                  newJob.description = newDesc;
                                  newExp[idx] = newJob;
                                  updateField("experience", newExp);
                                }}
                                className="w-full border p-1 rounded h-auto resize-none overflow-hidden"
                                rows={1}
                                style={{ height: "auto" }}
                                onInput={(e) => {
                                  e.currentTarget.style.height = "auto";
                                  e.currentTarget.style.height =
                                    e.currentTarget.scrollHeight + "px";
                                }}
                              />
                            ) : (
                              point
                            )}
                          </li>
                        ))}
                        {isEditing && (
                          <li>
                            <button
                              onClick={() => {
                                const newExp = [...experience];
                                const newJob = { ...newExp[idx] };
                                newJob.description = [
                                  ...newJob.description,
                                  "",
                                ];
                                newExp[idx] = newJob;
                                updateField("experience", newExp);
                              }}
                              className="text-indigo-600 text-xs hover:underline"
                            >
                              + Add Bullet Point
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => {
                        updateField("experience", [
                          ...experience,
                          {
                            role: "New Role",
                            company: "Company",
                            duration: "Date",
                            description: ["Description"],
                          },
                        ]);
                      }}
                      className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-lg hover:bg-indigo-50"
                    >
                      + Add Experience
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Projects */}
            {((projects && projects.length > 0) || isEditing) && (
              <section className="mb-6">
                {isEditing ? (
                  <input
                    value={sectionTitles.projects}
                    onChange={(e) =>
                      updateNestedField(
                        "sectionTitles",
                        "projects",
                        e.target.value,
                      )
                    }
                    className={`${styles.sectionTitle} w-full border-dashed focus:border-indigo-500 focus:outline-none`}
                  />
                ) : (
                  <h2 className={styles.sectionTitle}>
                    {sectionTitles.projects}
                  </h2>
                )}

                <div className="space-y-4">
                  {projects?.map((proj, idx) => (
                    <div key={idx} className="relative group">
                      {isEditing && (
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const newProj = [...(projects || [])];
                              newProj.splice(idx, 1);
                              updateField("projects", newProj);
                            }}
                            className="text-red-500 bg-white border border-red-200 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline gap-4">
                        {isEditing ? (
                          <input
                            value={proj.name}
                            onChange={(e) => {
                              const newProj = [...(projects || [])];
                              newProj[idx] = { ...proj, name: e.target.value };
                              updateField("projects", newProj);
                            }}
                            className={`${styles.role} border-b border-dashed border-gray-300 w-1/3`}
                            placeholder="Project Name"
                          />
                        ) : (
                          <h3 className={styles.role}>{proj.name}</h3>
                        )}
                        {isEditing ? (
                          <input
                            value={proj.techStack.join(", ")}
                            onChange={(e) => {
                              const newProj = [...(projects || [])];
                              newProj[idx] = {
                                ...proj,
                                techStack: e.target.value
                                  .split(",")
                                  .map((s) => s.trim()),
                              };
                              updateField("projects", newProj);
                            }}
                            className={`${styles.techStack} border-b border-dashed border-gray-300 w-1/2`}
                            placeholder="Tech Stack (comma separated)"
                          />
                        ) : (
                          proj.techStack && (
                            <span className={styles.techStack}>
                              [{proj.techStack.join(", ")}]
                            </span>
                          )
                        )}
                      </div>
                      {isEditing ? (
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const newProj = [...(projects || [])];
                            newProj[idx] = {
                              ...proj,
                              description: e.target.value,
                            };
                            updateField("projects", newProj);
                          }}
                          className="w-full text-sm text-slate-700 mt-1 border p-1 rounded"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm text-slate-700 mt-1">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => {
                        updateField("projects", [
                          ...(projects || []),
                          {
                            name: "New Project",
                            description: "Description",
                            techStack: [],
                          },
                        ]);
                      }}
                      className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-lg hover:bg-indigo-50"
                    >
                      + Add Project
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Education */}
            {((education && education.length > 0) || isEditing) && (
              <section className="mb-6">
                {isEditing ? (
                  <input
                    value={sectionTitles.education}
                    onChange={(e) =>
                      updateNestedField(
                        "sectionTitles",
                        "education",
                        e.target.value,
                      )
                    }
                    className={`${styles.sectionTitle} w-full border-dashed focus:border-indigo-500 focus:outline-none`}
                  />
                ) : (
                  <h2 className={styles.sectionTitle}>
                    {sectionTitles.education}
                  </h2>
                )}

                <div className="space-y-2">
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between relative group"
                    >
                      {isEditing && (
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const newEdu = [...education];
                              newEdu.splice(idx, 1);
                              updateField("education", newEdu);
                            }}
                            className="text-red-500 bg-white border border-red-200 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50"
                          >
                            &times;
                          </button>
                        </div>
                      )}
                      <div className="w-2/3">
                        {isEditing ? (
                          <>
                            <input
                              value={edu.school}
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[idx] = {
                                  ...edu,
                                  school: e.target.value,
                                };
                                updateField("education", newEdu);
                              }}
                              className={`${styles.role} w-full border-b border-dashed border-gray-300`}
                              placeholder="School"
                            />
                            <input
                              value={edu.degree}
                              onChange={(e) => {
                                const newEdu = [...education];
                                newEdu[idx] = {
                                  ...edu,
                                  degree: e.target.value,
                                };
                                updateField("education", newEdu);
                              }}
                              className={`${styles.company} w-full border-b border-dashed border-gray-300`}
                              placeholder="Degree"
                            />
                          </>
                        ) : (
                          <>
                            <div className={styles.role}>{edu.school}</div>
                            <div className={styles.company}>{edu.degree}</div>
                          </>
                        )}
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            value={edu.year}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[idx] = { ...edu, year: e.target.value };
                              updateField("education", newEdu);
                            }}
                            className="text-sm font-semibold text-slate-600 text-right border-b border-dashed border-gray-300 w-24"
                            placeholder="Year"
                          />
                        ) : (
                          <div className="text-sm font-semibold text-slate-600">
                            {edu.year}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => {
                        updateField("education", [
                          ...education,
                          {
                            school: "University",
                            degree: "Degree",
                            year: "Year",
                          },
                        ]);
                      }}
                      className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-lg hover:bg-indigo-50 mt-2"
                    >
                      + Add Education
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
